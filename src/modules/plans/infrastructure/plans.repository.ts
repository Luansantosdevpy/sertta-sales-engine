import { PlanModel } from './plan.model';

export const plansRepository = {
  async listActive() {
    return PlanModel.find({ status: 'active' }).sort({ monthlyPriceCents: 1, createdAt: -1 });
  },

  async getById(planId: string) {
    return PlanModel.findById(planId);
  }
};

