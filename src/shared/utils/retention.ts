export const buildRetentionDate = (days: number): Date => {
  const now = Date.now();
  const expiresInMs = days * 24 * 60 * 60 * 1000;
  return new Date(now + expiresInMs);
};
