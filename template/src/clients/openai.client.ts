import { registerChatClient, convertTools } from 'kitagent';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiClient = async () => {
  registerChatClient('openai', {
    chat: async ({ session, tools, context }) => {
      // Convert tools to OpenAI format if any are provided
      const availableTools = tools ? convertTools(tools) : [];

      // Map session messages to OpenAI format
      const messages = session.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      // Call OpenAI with the messages and tools
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages,
        tools: availableTools.length > 0 ? availableTools : undefined,
        temperature: 0.7,
      });

      // Parse any tool calls if they exist
      if (response.choices[0]?.message.tool_calls && response.choices[0]?.message.tool_calls.length > 0) {
        const toolCalls = response.choices[0].message.tool_calls;

        let finalResponse = response.choices[0].message.content || '';

        // Process each tool call
        for (const toolCall of toolCalls) {
          const toolName = toolCall.function.name;
          const toolArguments = JSON.parse(toolCall.function.arguments);

          if (tools && tools[toolName]) {
            try {
              // Execute the tool
              const toolResult = await tools[toolName].execute({
                params: toolArguments,
                context
              });

              // Add tool result to the conversation
              const toolResultStr = JSON.stringify(toolResult, null, 2);
              finalResponse += `\n\nTool Result (${toolName}):\n${toolResultStr}`;
            } catch (error) {
              console.error(`Error executing tool ${toolName}:`, error);
              finalResponse += `\n\nError executing tool ${toolName}: ${error.message}`;
            }
          } else {
            finalResponse += `\n\nTool ${toolName} not found`;
          }
        }

        return finalResponse;
      }

      // Return the response content
      return response.choices[0]?.message?.content || 'No response generated';
    }
  });
};

export default openaiClient;