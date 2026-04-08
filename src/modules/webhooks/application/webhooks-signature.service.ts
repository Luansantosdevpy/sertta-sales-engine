import { config } from '../../../config';
import { UnauthorizedError } from '../../../shared/errors/application-errors';
import { verifyHmacSha256Signature } from '../../../shared/security/signature-verifier';
import type { WebhookProvider } from '../domain/webhook-event.types';

export const webhooksSignatureService = {
  verifyOrThrow(input: {
    provider: WebhookProvider;
    rawBody: Buffer | undefined;
    headers: Record<string, string | string[] | undefined>;
  }) {
    const signatureHeader =
      (input.headers['x-webhook-signature'] as string | undefined) ??
      (input.headers['x-hub-signature-256'] as string | undefined) ??
      (input.headers['stripe-signature'] as string | undefined);

    const secret = config.webhooks.defaultSignatureSecret;

    if (!secret) {
      return;
    }

    if (!input.rawBody) {
      throw new UnauthorizedError('Missing raw body for signature verification');
    }

    const ok = verifyHmacSha256Signature({
      rawBody: input.rawBody,
      secret,
      signatureHeader
    });

    if (!ok) {
      throw new UnauthorizedError('Invalid webhook signature');
    }
  }
};
