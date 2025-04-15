import { registerAgent } from '@kitagent/core';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default () => {
  registerAgent({
    name: 'openai',
    chat: async ({ messages }) => {
      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
      });
      return res.choices[0].message.content || '';
    },
  });
};
