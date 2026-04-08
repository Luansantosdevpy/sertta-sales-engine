import { ExecutionLogModel } from './execution-log.model';
import { JobRecordModel } from './job-record.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const executionsRepository = {
  async listJobs(tenantId: string, status?: string) {
    return JobRecordModel.find(withTenantScope(tenantId, { ...(status ? { status } : {}) }))
      .sort({ createdAt: -1 })
      .limit(200)
      ;
  },

  async listLogs(tenantId: string, level?: string, status?: string) {
    return ExecutionLogModel.find(
      withTenantScope(tenantId, {
        ...(level ? { level } : {}),
        ...(status ? { status } : {})
      })
    )
      .sort({ createdAt: -1 })
      .limit(300)
      ;
  }
};

