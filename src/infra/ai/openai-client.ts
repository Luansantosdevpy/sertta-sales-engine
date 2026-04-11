import { config } from '../../config';

interface OpenAiChatMessage {
  role: 'system' | 'user';
  content: string;
}

interface OpenAiCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

export const openAiClient = {
  async createJsonCompletion(params: {
    messages: OpenAiChatMessage[];
  }): Promise<{ content: string; promptTokens?: number; completionTokens?: number }> {
    if (!config.ai.openAi.apiKey) {
      throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.ai.openAi.timeoutMs);

    try {
      const response = await fetch(`${config.ai.openAi.baseUrl}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${config.ai.openAi.apiKey}`
        },
        body: JSON.stringify({
          model: config.ai.openAi.model,
          temperature: config.ai.openAi.temperature,
          messages: params.messages,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenAI request failed with ${response.status}: ${text}`);
      }

      const data = (await response.json()) as OpenAiCompletionResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content || content.trim().length === 0) {
        throw new Error('OpenAI response did not include completion content');
      }

      return {
        content,
        ...(typeof data.usage?.prompt_tokens === 'number' ? { promptTokens: data.usage.prompt_tokens } : {}),
        ...(typeof data.usage?.completion_tokens === 'number'
          ? { completionTokens: data.usage.completion_tokens }
          : {})
      };
    } finally {
      clearTimeout(timer);
    }
  }
};
