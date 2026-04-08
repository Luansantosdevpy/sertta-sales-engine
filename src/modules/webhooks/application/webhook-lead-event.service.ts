import { logger } from '../../../infra/logger/pino';
import { executionLoggingService } from '../../executions/application/execution-logging.service';
import { contactsService } from '../../contacts/application/contacts.service';
import { usageService } from '../../usage/application/usage.service';
import { webhooksRepository } from '../infrastructure/webhooks.repository';

const isInboundLeadEvent = (eventType: string): boolean => {
  const normalized = eventType.trim().toLowerCase();

  return (
    normalized === 'lead.created' ||
    normalized === 'lead.inbound' ||
    normalized === 'contact.inbound' ||
    (normalized.includes('lead') && normalized.includes('inbound'))
  );
};

const toLeadData = (normalizedData: Record<string, unknown>) => {
  const firstName = typeof normalizedData['firstName'] === 'string' ? normalizedData['firstName'].trim() : '';
  const lastName = typeof normalizedData['lastName'] === 'string' ? normalizedData['lastName'].trim() : '';
  const fullNameFromParts = `${firstName} ${lastName}`.trim();

  return {
    ...(typeof normalizedData['leadId'] === 'string'
      ? { externalId: normalizedData['leadId'] }
      : typeof normalizedData['externalId'] === 'string'
        ? { externalId: normalizedData['externalId'] }
        : {}),
    ...(typeof normalizedData['fullName'] === 'string'
      ? { fullName: normalizedData['fullName'] }
      : fullNameFromParts.length > 0
        ? { fullName: fullNameFromParts }
        : {}),
    ...(typeof normalizedData['email'] === 'string' ? { email: normalizedData['email'] } : {}),
    ...(typeof normalizedData['phone'] === 'string' ? { phone: normalizedData['phone'] } : {}),
    source: typeof normalizedData['source'] === 'string' ? normalizedData['source'] : 'webhook',
    tags: Array.isArray(normalizedData['tags'])
      ? normalizedData['tags'].filter((value): value is string => typeof value === 'string')
      : ['inbound-lead']
  };
};

export const webhookLeadEventService = {
  async processWebhookEvent(params: {
    tenantId: string;
    webhookEventId: string;
    correlationId: string;
  }): Promise<{ status: 'processed' | 'ignored'; reason?: string; contactId?: string; created?: boolean }> {
    const event = await webhooksRepository.findById(params.webhookEventId);

    if (!event) {
      return {
        status: 'ignored',
        reason: 'Webhook event not found'
      };
    }

    if (String(event['tenantId']) !== params.tenantId) {
      return {
        status: 'ignored',
        reason: 'Tenant mismatch for webhook event'
      };
    }

    const eventType = String(event['eventType']);

    if (!isInboundLeadEvent(eventType)) {
      await webhooksRepository.markIgnored(params.webhookEventId, 'Unsupported event type for lead flow');

      await executionLoggingService.writeWebhookLog({
        tenantId: params.tenantId,
        webhookEventId: params.webhookEventId,
        correlationId: params.correlationId,
        level: 'warn',
        status: 'step_failed',
        stepKey: 'event-filter',
        message: `Event ignored: ${eventType}`,
        errorCode: 'unsupported_event_type',
        payload: {
          eventType
        }
      });

      return {
        status: 'ignored',
        reason: 'Unsupported event type'
      };
    }

    await executionLoggingService.writeWebhookLog({
      tenantId: params.tenantId,
      webhookEventId: params.webhookEventId,
      correlationId: params.correlationId,
      level: 'info',
      status: 'started',
      stepKey: 'lead-processing-start',
      message: `Processing inbound lead event ${eventType}`,
      payload: {
        eventType
      }
    });

    try {
      const normalized = event['normalized'] as Record<string, unknown>;
      const normalizedData = (normalized['data'] as Record<string, unknown> | undefined) ?? {};
      const lead = toLeadData(normalizedData);

      const upsertResult = await contactsService.upsertFromInboundLead(params.tenantId, lead);

      await usageService.trackEvent({
        tenantId: params.tenantId,
        metric: 'webhook_inbound_lead_events',
        period: 'daily',
        amount: 1,
        dimensionKey: String(event['provider'])
      });

      if (upsertResult.created) {
        await usageService.trackEvent({
          tenantId: params.tenantId,
          metric: 'contacts_created_from_webhook',
          period: 'daily',
          amount: 1,
          dimensionKey: String(event['provider'])
        });
      }

      await executionLoggingService.writeWebhookLog({
        tenantId: params.tenantId,
        webhookEventId: params.webhookEventId,
        correlationId: params.correlationId,
        level: 'info',
        status: 'finished',
        stepKey: 'lead-processing-finished',
        message: upsertResult.created
          ? 'Inbound lead created as new contact'
          : 'Inbound lead merged into existing contact',
        payload: {
          contactId: String(upsertResult.contact['_id']),
          created: upsertResult.created
        }
      });

      logger.info(
        {
          tenantId: params.tenantId,
          webhookEventId: params.webhookEventId,
          contactId: String(upsertResult.contact['_id']),
          created: upsertResult.created
        },
        'Inbound lead event processed successfully'
      );

      return {
        status: 'processed',
        contactId: String(upsertResult.contact['_id']),
        created: upsertResult.created
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown lead processing error';

      await executionLoggingService.writeWebhookLog({
        tenantId: params.tenantId,
        webhookEventId: params.webhookEventId,
        correlationId: params.correlationId,
        level: 'error',
        status: 'step_failed',
        stepKey: 'lead-processing-error',
        message: 'Inbound lead processing failed',
        errorCode: 'lead_processing_failed',
        payload: {
          errorMessage: message
        }
      });

      throw error;
    }
  }
};
