import { z } from 'zod';

/**
 * Converts a Zod schema to OpenAI function parameters format
 */
export function zodToJsonSchema(schema: z.ZodObject<any>): any {
  const shape = schema.shape;
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(shape)) {
    properties[key] = zodTypeToJsonSchema(value as never, key);

    // Add to required array if not optional or nullable
    if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodNullable)) {
      required.push(key);
    }
  }

  return {
    type: "object",
    properties,
    required: required.length > 0 ? required : undefined
  };
}

function zodTypeToJsonSchema(schema: z.ZodTypeAny, propertyName: string): any {
  // Handle optional/nullable wrappers
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return zodTypeToJsonSchema(schema.unwrap(), propertyName);
  }

  // String types
  if (schema instanceof z.ZodString) {
    const result: any = {
      type: 'string',
    };

    if (schema.description) {
      result.description = schema.description;
    }

    return result;
  }

  // Number types
  if (schema instanceof z.ZodNumber) {
    const result: any = {
      type: 'number',
    };

    if (schema.description) {
      result.description = schema.description;
    }

    return result;
  }

  // Boolean types
  if (schema instanceof z.ZodBoolean) {
    const result: any = {
      type: 'boolean',
    };

    if (schema.description) {
      result.description = schema.description;
    }

    return result;
  }

  // Array types
  if (schema instanceof z.ZodArray) {
    const result: any = {
      type: 'array',
      items: zodTypeToJsonSchema(schema.element, `${propertyName}[]`),
    };

    if (schema.description) {
      result.description = schema.description;
    }

    return result;
  }

  // Object types
  if (schema instanceof z.ZodObject) {
    return zodToJsonSchema(schema);
  }

  // Enum types
  if (schema instanceof z.ZodEnum) {
    const result: any = {
      type: 'string',
      enum: schema.options,
    };

    if (schema.description) {
      result.description = schema.description;
    }

    return result;
  }

  // Any/unknown types
  if (schema instanceof z.ZodAny || schema instanceof z.ZodUnknown) {
    return { type: 'object' };
  }

  // Union types (handle as oneOf in JSON Schema)
  if (schema instanceof z.ZodUnion) {
    // This is a simplification - handling unions properly is complex
    return { oneOf: schema._def.options.map((opt: z.ZodTypeAny) =>
        zodTypeToJsonSchema(opt, propertyName)
      )};
  }

  // Default fallback
  return { type: 'object' };
}

/**
 * Validates input against a Zod schema and returns the result
 */
export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  input: any
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const result = schema.parse(input);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}