type StepHandler = (input: any, context: any) => Promise<any>;

const registry = new Map<string, StepHandler>();

export function registerStep(type: string, handler: StepHandler) {
  registry.set(type, handler);
}

export function getStepHandler(type: string): StepHandler {
  const handler = registry.get(type);
  if (!handler) throw new Error(`Step type "${type}" not registered`);
  return handler;
}
