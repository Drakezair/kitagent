export function getValueFromContext(key: string, context: Record<string, any>): any {
  const parts = key.split('.');
  let value = context;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return undefined;
    }
  }

  return value;
}
