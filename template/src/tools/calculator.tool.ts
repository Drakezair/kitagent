import {registerTool, z} from 'kitagent';

const calculatorTool = {
  name: 'calculator',
  description: 'Performs basic arithmetic operations',
  parameters: {
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The operation to perform, options are: add, subtract, multiply, divide'),
    a: z.number().describe('First number'),
    b: z.number().describe('Second number')
  },
  execute: async ({params}: any) => {
    const {operation, a, b} = params;

    let result;
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) throw new Error('Cannot divide by zero');
        result = a / b;
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return {
      result,
      operation,
      a,
      b
    };
  }
};

registerTool(calculatorTool);

export default calculatorTool;