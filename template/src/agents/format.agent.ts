import { registerAgent, convertTools, z } from 'kitagent';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const formatAgent = {
  name: 'formatAgent',
  description: 'Formats calculation results in a readable way',
  parameters: z.object({
    format: z.enum(['json', 'text', 'markdown']).default('text')
      .describe('The output format desired')
  }),
  task: async ({ params, context, tools }: any) => {
    const { format } = params;

    // Get the result from the previous step
    const calculationResult = context.previousStepResult();

    // Convert all tools to OpenAI function format
    const availableTools = convertTools(tools);

    // Call OpenAI to format the result
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that formats calculation results.'
        },
        {
          role: 'user',
          content: `Format this calculation result in ${format} format: ${JSON.stringify(calculationResult)}`
        }
      ],
      tools: availableTools as any,
      temperature: 0.2,
    });

    // Get the response content
    const formattedResult = response.choices[0]?.message?.content || 'No result provided';

    return {
      original: calculationResult,
      formatted: formattedResult,
      format
    };
  }
};

registerAgent(formatAgent);

export default formatAgent;