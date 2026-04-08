import { createHmac, timingSafeEqual } from 'node:crypto';

interface SignatureVerifyInput {
  rawBody: Buffer;
  secret: string;
  signatureHeader: string | undefined;
}

const parseSignature = (value: string | undefined): string | null => {
  if (!value || value.length === 0) {
    return null;
  }

  if (value.startsWith('sha256=')) {
    return value.slice('sha256='.length);
  }

  return value;
};

export const verifyHmacSha256Signature = (input: SignatureVerifyInput): boolean => {
  const provided = parseSignature(input.signatureHeader);

  if (!provided) {
    return false;
  }

  const expected = createHmac('sha256', input.secret).update(input.rawBody).digest('hex');

  const providedBuffer = Buffer.from(provided, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
};
