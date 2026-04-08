import { contactsRepository } from '../infrastructure/contacts.repository';

interface InboundLeadData {
  externalId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  source?: string;
  tags?: string[];
}

export const contactsService = {
  async upsertFromInboundLead(tenantId: string, lead: InboundLeadData) {
    return contactsRepository.upsertInboundLead({
      tenantId,
      ...(lead.externalId ? { externalId: lead.externalId } : {}),
      ...(lead.fullName ? { fullName: lead.fullName } : {}),
      ...(lead.email ? { primaryEmail: lead.email } : {}),
      ...(lead.phone ? { primaryPhone: lead.phone } : {}),
      ...(lead.source ? { source: lead.source } : {}),
      ...(lead.tags ? { tags: lead.tags } : {})
    });
  }
};
