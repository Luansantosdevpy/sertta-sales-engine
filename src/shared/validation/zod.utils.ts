import type { ZodTypeAny } from 'zod';

export const parseOrThrow = <TSchema extends ZodTypeAny>(schema: TSchema, input: unknown) => {
  return schema.parse(input);
};

export const safeParse = <TSchema extends ZodTypeAny>(schema: TSchema, input: unknown) => {
  return schema.safeParse(input);
};
