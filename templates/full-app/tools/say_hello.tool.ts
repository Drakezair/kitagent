import { registerTool } from '@kitagent/core';

export default () => {
  registerTool('say_hello', async (input) => {
    return { message: `Hola ${input.name}` };
  });
};
