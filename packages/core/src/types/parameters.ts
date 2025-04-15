export type ParameterSchema =
  | StringParameter
  | NumberParameter
  | BooleanParameter
  | ArrayParameter
  | ObjectParameter
  | AnyParameter
  | EnumParameter;

export interface StringParameter {
  type: "string";
  description?: string;
  nullable?: boolean;
  format?: "date-time";
}

export interface NumberParameter {
  type: "number";
  description?: string;
  nullable?: boolean;
}

export interface BooleanParameter {
  type: "boolean";
  description?: string;
  nullable?: boolean;
}

export interface ArrayParameter {
  type: "array";
  items: ParameterSchema;
  description?: string;
  nullable?: boolean;

}

export interface ObjectParameter {
  type: "object";
  properties: Record<string, ParameterSchema>;
  required?: string[];
  description?: string;
  nullable?: boolean;

}

export interface EnumParameter {
  type: "enum";
  values: string[];
  description?: string;
  nullable?: boolean;

}

export interface AnyParameter {
  type: "any";
  description?: string;
  nullable?: boolean;
}

export type ParametersDefinition = Record<string, ParameterSchema>;

// Context opcional (puede expandirse luego)
export type ToolContext = {
  [key: string]: any;
};

// Input calculado en tiempo de ejecución
export type ToolInput = {
  [key: string]: any;
};

// Resultado esperado de un tool
export type ToolResult = any;

// Función que ejecuta el tool
export type ToolExecuteFunction = (args: {
  input: ToolInput;
  context: ToolContext;
}) => Promise<ToolResult> | ToolResult;

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ParametersDefinition;
  execute: ToolExecuteFunction;
}
