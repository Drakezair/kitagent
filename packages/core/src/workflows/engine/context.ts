import {WorkflowContext} from "../../types";

export class Context implements WorkflowContext {
  private store: Record<string, any> = {};
  private prevStepResult: any;
  private workflowGlobals: any = null;

  constructor(initialValues?: Record<string, any>) {
    if (initialValues) {
      this.store = { ...initialValues };
    }
  }

  get<T = any>(key: string): T | undefined {
    return this.store[key];
  }

  set<T = any>(key: string, value: T): void {
    this.store[key] = value;
  }

  has(key: string): boolean {
    return key in this.store;
  }

  merge(data: Record<string, any>): void {
    this.store = {
      ...this.store,
      ...data,
    };
  }

  toJSON(): Record<string, any> {
    return { ...this.store };
  }

  previousStepResult(): any {
    return this.prevStepResult;
  }

  setPreviousStepResult(result: any): void {
    this.prevStepResult = result;
  }

  setWorkflowGlobals(workflow: any): void {
    this.workflowGlobals = workflow;
  }

  getWorkflowGlobals(): any {
    return this.workflowGlobals;
  }
}
