import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const SCRYPT_KEY_LEN = 64;

export const hashPassword = async (rawPassword: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(rawPassword, salt, SCRYPT_KEY_LEN)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
};

export const verifyPassword = async (rawPassword: string, passwordHash: string): Promise<boolean> => {
  const parts = passwordHash.split('$');

  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }

  const salt = parts[1];
  const hash = parts[2];

  if (!salt || !hash) {
    return false;
  }

  const storedHash = Buffer.from(hash, 'hex');
  const candidateHash = (await scrypt(rawPassword, salt, SCRYPT_KEY_LEN)) as Buffer;

  if (storedHash.length !== candidateHash.length) {
    return false;
  }

  return timingSafeEqual(storedHash, candidateHash);
};
