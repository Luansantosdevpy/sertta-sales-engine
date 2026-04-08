import { ContactModel } from './contact.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export interface UpsertContactInput {
  tenantId: string;
  externalId?: string;
  fullName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  source?: string;
  tags?: string[];
}

const normalizeEmail = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value.trim().toLowerCase();
};

const normalizePhone = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value.trim();
};

export const contactsRepository = {
  async upsertInboundLead(input: UpsertContactInput) {
    const externalId = input.externalId?.trim();
    const primaryEmail = normalizeEmail(input.primaryEmail);
    const primaryPhone = normalizePhone(input.primaryPhone);

    const lookupCandidates: Record<string, unknown>[] = [];

    if (externalId) {
      lookupCandidates.push(withTenantScope(input.tenantId, { externalId }));
    }

    if (primaryPhone) {
      lookupCandidates.push(withTenantScope(input.tenantId, { primaryPhone }));
    }

    if (primaryEmail) {
      lookupCandidates.push(withTenantScope(input.tenantId, { primaryEmail }));
    }

    const existing =
      lookupCandidates.length > 0 ? await ContactModel.findOne({ $or: lookupCandidates }).sort({ createdAt: -1 }) : null;

    if (existing) {
      existing.set({
        ...(input.fullName ? { fullName: input.fullName } : {}),
        ...(primaryEmail ? { primaryEmail } : {}),
        ...(primaryPhone ? { primaryPhone } : {}),
        ...(externalId ? { externalId } : {}),
        ...(input.source ? { source: input.source } : {}),
        ...(input.tags && input.tags.length > 0 ? { tags: input.tags } : {}),
        lastSeenAt: new Date(),
        status: 'active'
      });

      await existing.save();
      return { contact: existing, created: false };
    }

    const created = await ContactModel.create(
      withTenantScope(input.tenantId, {
        ...(input.fullName ? { fullName: input.fullName } : {}),
        ...(primaryEmail ? { primaryEmail } : {}),
        ...(primaryPhone ? { primaryPhone } : {}),
        ...(externalId ? { externalId } : {}),
        ...(input.source ? { source: input.source } : {}),
        ...(input.tags && input.tags.length > 0 ? { tags: input.tags } : {}),
        status: 'active',
        lastSeenAt: new Date()
      })
    );

    return { contact: created, created: true };
  }
};
