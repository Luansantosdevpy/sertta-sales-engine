import { z } from 'zod';
import { logger } from '../../../../infra/logger/pino';
import { config } from '../../../../config';
import { openAiClient } from '../../../../infra/ai/openai-client';
import type { AssistantActionType, AssistantIntent } from '../../domain/assistant.types';

export interface AssistantDecisionResult {
  intent: AssistantIntent;
  confidence: number;
  suggestedAction: AssistantActionType;
  outputMessage: string;
  promptTokens?: number;
  completionTokens?: number;
}

const decisionSchema = z.object({
  intent: z.enum(['schedule_request', 'order_request', 'product_question', 'support_question', 'fallback']),
  confidence: z.number().min(0).max(1),
  suggestedAction: z.enum(['appointment.create', 'order.create', 'knowledge.answer', 'human.handoff', 'message.reply']),
  outputMessage: z.string().min(1).max(1000)
});

const normalizeMessage = (message: string): string => message.trim().toLowerCase();

const heuristicDecision = (params: {
  messageText: string;
  tone: 'friendly' | 'formal' | 'sales';
  catalogHint?: string;
  knowledgeSnippets: string[];
}): AssistantDecisionResult => {
  const normalized = normalizeMessage(params.messageText);

  const openingByTone = {
    friendly: 'Perfeito, vou te ajudar com isso.',
    formal: 'Entendido. Vou seguir com sua solicitacao.',
    sales: 'Excelente, vamos resolver isso agora para voce.'
  } as const;

  const opening = openingByTone[params.tone];

  if (/agendar|marcar|agenda|horario|horario/.test(normalized)) {
    return {
      intent: 'schedule_request',
      confidence: 0.89,
      suggestedAction: 'appointment.create',
      outputMessage: `${opening} Posso sugerir um horario para nossa conversa e confirmar com voce em seguida.`
    };
  }

  if (/comprar|pedido|orcamento|orcamento|fechar/.test(normalized)) {
    return {
      intent: 'order_request',
      confidence: 0.87,
      suggestedAction: 'order.create',
      outputMessage: `${opening} Iniciei seu pedido e ja posso seguir para confirmacao dos itens.`
    };
  }

  if (/produto|servico|servico|preco|preco|plano/.test(normalized)) {
    return {
      intent: 'product_question',
      confidence: 0.8,
      suggestedAction: 'knowledge.answer',
      outputMessage: params.catalogHint
        ? `${opening} Sobre o que voce pediu: ${params.catalogHint}`
        : `${opening} Posso detalhar as opcoes de produto e servico para voce.`
    };
  }

  if (/suporte|ajuda|problema|erro/.test(normalized)) {
    return {
      intent: 'support_question',
      confidence: 0.7,
      suggestedAction: 'message.reply',
      outputMessage:
        params.knowledgeSnippets.length > 0
          ? `${opening} ${params.knowledgeSnippets[0]}`
          : `${opening} Pode me contar mais detalhes para eu te orientar com precisao?`
    };
  }

  return {
    intent: 'fallback',
    confidence: 0.45,
    suggestedAction: 'human.handoff',
    outputMessage: `${opening} Pode me dar mais detalhes para eu te atender com precisao?`
  };
};

const buildSystemPrompt = (params: {
  tone: 'friendly' | 'formal' | 'sales';
  language: string;
  handoffEnabled: boolean;
}) => {
  return [
    'You are a tenant-scoped WhatsApp AI attendant for a SaaS platform.',
    `Reply language: ${params.language}.`,
    `Tone: ${params.tone}.`,
    'Never invent product, price, policy, or availability data not present in provided context.',
    'If confidence is low, prefer fallback. If handoff is enabled and confidence is low, suggest human.handoff.',
    `Handoff enabled: ${params.handoffEnabled ? 'yes' : 'no'}.`,
    'Return valid JSON only with fields: intent, confidence, suggestedAction, outputMessage.'
  ].join(' ');
};

const buildUserPrompt = (params: {
  messageText: string;
  catalogSummaries: string[];
  knowledgeSnippets: string[];
}) => {
  const catalogBlock = params.catalogSummaries.length > 0 ? params.catalogSummaries.join('\n') : 'No catalog matches.';
  const knowledgeBlock = params.knowledgeSnippets.length > 0 ? params.knowledgeSnippets.join('\n') : 'No knowledge matches.';

  return [
    'Customer message:',
    params.messageText,
    '',
    'Catalog context:',
    catalogBlock,
    '',
    'Knowledge context:',
    knowledgeBlock,
    '',
    'Choose one suggestedAction from: appointment.create, order.create, knowledge.answer, human.handoff, message.reply.',
    'If uncertain, use fallback intent and human.handoff or message.reply.'
  ].join('\n');
};

export const aiDecisionService = {
  async decide(params: {
    messageText: string;
    tone: 'friendly' | 'formal' | 'sales';
    language: string;
    handoffEnabled: boolean;
    catalogSummaries: string[];
    knowledgeSnippets: string[];
  }): Promise<AssistantDecisionResult> {
    if (config.ai.provider !== 'openai') {
      return heuristicDecision({
        messageText: params.messageText,
        tone: params.tone,
        knowledgeSnippets: params.knowledgeSnippets,
        ...(params.catalogSummaries[0] ? { catalogHint: params.catalogSummaries[0] } : {})
      });
    }

    try {
      const response = await openAiClient.createJsonCompletion({
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt({
              tone: params.tone,
              language: params.language,
              handoffEnabled: params.handoffEnabled
            })
          },
          {
            role: 'user',
            content: buildUserPrompt({
              messageText: params.messageText,
              catalogSummaries: params.catalogSummaries,
              knowledgeSnippets: params.knowledgeSnippets
            })
          }
        ]
      });

      const parsed = decisionSchema.parse(JSON.parse(response.content));

      return {
        intent: parsed.intent,
        confidence: parsed.confidence,
        suggestedAction: parsed.suggestedAction,
        outputMessage: parsed.outputMessage,
        ...(typeof response.promptTokens === 'number' ? { promptTokens: response.promptTokens } : {}),
        ...(typeof response.completionTokens === 'number'
          ? { completionTokens: response.completionTokens }
          : {})
      };
    } catch (error) {
      logger.warn(
        {
          err: error,
          provider: 'openai'
        },
        'OpenAI decision failed, using heuristic fallback'
      );

      return heuristicDecision({
        messageText: params.messageText,
        tone: params.tone,
        knowledgeSnippets: params.knowledgeSnippets,
        ...(params.catalogSummaries[0] ? { catalogHint: params.catalogSummaries[0] } : {})
      });
    }
  }
};
