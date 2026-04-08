import { NotFoundError } from '../../../shared/errors/application-errors';
import { plansRepository } from '../infrastructure/plans.repository';

export const plansService = {
  async listActivePlans() {
    const plans = await plansRepository.listActive();

    return plans.map((plan) => ({
      id: String(plan['_id']),
      code: String(plan['code']),
      name: String(plan['name']),
      monthlyPriceCents: Number(plan['monthlyPriceCents']),
      currency: String(plan['currency']),
      limits: plan['limits'],
      features: plan['features'],
      version: Number(plan['version'])
    }));
  },

  async getPlan(planId: string) {
    const plan = await plansRepository.getById(planId);

    if (!plan) {
      throw new NotFoundError('Plan not found');
    }

    return plan;
  }
};
