import { getValueFromContext } from './getValueFromContext';

export function interpolate(input: any, context: any): any {
  if (typeof input === 'string') {
    return input.replace(/\$\{([\w\d_\.]+)\}/g, (_, key) => {
      const value = getValueFromContext(key, context);
      return value !== undefined ? value : '';
    });
  }

  if (Array.isArray(input)) {
    return input.map(item => interpolate(item, context));
  }

  if (typeof input === 'object' && input !== null) {
    const result: any = {};
    for (const key in input) {
      result[key] = interpolate(input[key], context);
    }
    return result;
  }

  return input;
}
