import { model, type SchemaDefinition, type SchemaOptions } from 'mongoose';
import { Schema } from 'mongoose';
import { applyToJsonPlugin } from '../plugins/to-json.plugin';

export interface BaseDocumentFields {
  createdAt: Date;
  updatedAt: Date;
}

export const createBaseSchema = <TDefinition extends SchemaDefinition>(
  definition: TDefinition,
  options?: SchemaOptions
): Schema => {
  const schema = new Schema(definition, {
    timestamps: true,
    versionKey: false,
    ...options
  });

  applyToJsonPlugin(schema);
  return schema;
};

export const createModel = <TSchema>(name: string, schema: Schema<TSchema>) => {
  return model<TSchema>(name, schema);
};
