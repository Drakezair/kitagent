
type ParameterSchema =
  | {
  type: "string";
  description?: string;
  nullable?: boolean;
  format?: "date-time";
}
  | {
  type: "number";
  description?: string;
  nullable?: boolean;
}
  | {
  type: "boolean";
  description?: string;
  nullable?: boolean;
}
  | {
  type: "array";
  items: ParameterSchema;
  description?: string;
  nullable?: boolean;
}
  | {
  type: "object";
  properties: Record<string, ParameterSchema>;
  required?: string[];
  description?: string;
  nullable?: boolean;
}
  | {
  type: "enum";
  values: string[];
  description?: string;
  nullable?: boolean;
}
  | {
  type: "any";
  description?: string;
  nullable?: boolean;
};


type ParametersDefinition = Record<string, ParameterSchema>;

export function validateInputWithParameters(
  input: Record<string, any>,
  parameters: ParametersDefinition
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const validate = (key: string, schema: ParameterSchema, value: any, path: string) => {
    const currentPath = path ? `${path}.${key}` : key;

    if (value === undefined || value === null) {
      if ('nullable' in schema && schema.nullable) return;
      if ('required' in schema && schema.required?.includes(key)) {
        errors.push(`Missing required property: ${currentPath}`);
      } else if (!('nullable' in schema)) {
        errors.push(`Property ${currentPath} is required and cannot be null`);
      }
      return;
    }

    switch (schema.type) {
      case "any":
        // accept anything
        return;

      case "string":
        if (typeof value !== "string") {
          errors.push(`Expected string at ${currentPath}, got ${typeof value}`);
        } else if (schema.format === "date-time" && isNaN(Date.parse(value))) {
          errors.push(`Invalid date-time format at ${currentPath}`);
        }
        break;

      case "number":
        if (typeof value !== "number") {
          errors.push(`Expected number at ${currentPath}, got ${typeof value}`);
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          errors.push(`Expected boolean at ${currentPath}, got ${typeof value}`);
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          errors.push(`Expected array at ${currentPath}, got ${typeof value}`);
        } else {
          value.forEach((item, idx) =>
            validate(`[${idx}]`, schema.items, item, currentPath)
          );
        }
        break;

      case "object":
        if (typeof value !== "object" || Array.isArray(value)) {
          errors.push(`Expected object at ${currentPath}, got ${typeof value}`);
        } else {
          const requiredFields = schema.required || [];
          for (const [propKey, propSchema] of Object.entries(schema.properties)) {
            if (requiredFields.includes(propKey) && !(propKey in value)) {
              errors.push(`Missing required property: ${currentPath}.${propKey}`);
            } else {
              validate(propKey, propSchema, value[propKey], currentPath);
            }
          }
        }
        break;

      case "enum":
        if (!schema.values.includes(value)) {
          errors.push(`Invalid value at ${currentPath}. Expected one of: ${schema.values.join(", ")}`);
        }
        break;

      default:
        errors.push(`Unknown type for property ${currentPath}`);
    }
  };

  for (const [key, schema] of Object.entries(parameters)) {
    validate(key, schema, input[key], "");
  }

  return { valid: errors.length === 0, errors };
}




/**
 * Validates the structure of a ParametersDefinition schema
 */
export function validateParametersSchema(parameters: ParametersDefinition): string[] {
  const errors: string[] = [];

  const validate = (key: string, schema: ParameterSchema, path: string = key) => {
    if (!schema || typeof schema !== "object") {
      errors.push(`❌ Parameter '${path}' must be an object`);
      return;
    }

    // alow any type
    if (schema.type === "any") {
      return;
    }

    if (!("type" in schema)) {
      errors.push(`❌ Parameter '${path}' is missing 'type'`);
      return;
    }

    switch (schema.type) {
      case "string":
        // Optional: check format
        break;

      case "number":
      case "boolean":
        break;

      case "array":
        if (!("items" in schema)) {
          errors.push(`❌ Parameter '${path}' of type 'array' must include 'items'`);
        } else {
          validate(`${path}[]`, schema.items);
        }
        break;

      case "object":
        if (!schema.properties || typeof schema.properties !== "object") {
          errors.push(`❌ Parameter '${path}' of type 'object' must include 'properties'`);
        } else {
          for (const [subKey, subSchema] of Object.entries(schema.properties)) {
            validate(subKey, subSchema, `${path}.${subKey}`);
          }
        }
        break;

      case "enum":
        if (
          !("values" in schema) ||
          !Array.isArray(schema.values) ||
          !schema.values.every((v) => typeof v === "string")
        ) {
          errors.push(`❌ Parameter '${path}' of type 'enum' must have a 'values' array of strings`);
        }
        break;

      default:
        errors.push(`❌ Parameter '${path}' has unknown type '${(schema as any).type}'`);
    }
  };

  for (const [key, schema] of Object.entries(parameters)) {
    validate(key, schema);
  }

  return errors;
}