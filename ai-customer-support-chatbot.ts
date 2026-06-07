'use server';
/**
 * @fileOverview An AI-powered chatbot for Aatma HUB customer support.
 *
 * - aiCustomerSupportChatbot - A function that handles user queries for customer support.
 * - AiCustomerSupportChatbotInput - The input type for the aiCustomerSupportChatbot function.
 * - AiCustomerSupportChatbotOutput - The return type for the aiCustomerSupportChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCustomerSupportChatbotInputSchema = z.object({
  query: z.string().describe('The user\'s question or query for the chatbot.'),
});
export type AiCustomerSupportChatbotInput = z.infer<
  typeof AiCustomerSupportChatbotInputSchema
>;

const AiCustomerSupportChatbotOutputSchema = z.object({
  answer: z
    .string()
    .describe('The AI chatbot\'s answer to the user\'s query.'),
});
export type AiCustomerSupportChatbotOutput = z.infer<
  typeof AiCustomerSupportChatbotOutputSchema
>;

export async function aiCustomerSupportChatbot(
  input: AiCustomerSupportChatbotInput
): Promise<AiCustomerSupportChatbotOutput> {
  return aiCustomerSupportChatbotFlow(input);
}

const aiCustomerSupportChatbotPrompt = ai.definePrompt({
  name: 'aiCustomerSupportChatbotPrompt',
  input: {schema: AiCustomerSupportChatbotInputSchema},
  output: {schema: AiCustomerSupportChatbotOutputSchema},
  prompt: `You are Aatma, an AI customer support assistant for Aatma HUB, a gaming commerce platform. Your goal is to provide instant, helpful, and accurate assistance to users. Always keep your responses concise, professional, and friendly.

Your responsibilities include:
1.  **Answering Frequently Asked Questions (FAQs):** Address common inquiries about Aatma HUB services, policies, and general information.
2.  **Assisting with Common Order Issues:** Guide users on how to check their order status, resolve issues like delayed orders, or understand the order process.
3.  **Guiding on Game ID Location:** Provide clear, step-by-step instructions on how users can find their in-game IDs for popular mobile and PC games. This includes titles like Mobile Legends: Bang Bang, BGMI, PUBG Mobile, Free Fire, Free Fire MAX, Valorant, and Call of Duty Mobile.

When providing game ID instructions, make sure they are precise and easy to follow. If a user asks about an order, direct them to check their order history on the Aatma HUB platform. If you cannot directly solve a problem, advise the user on the next best step, such as contacting human support.

User Query: {{{query}}}`,
});

const aiCustomerSupportChatbotFlow = ai.defineFlow(
  {
    name: 'aiCustomerSupportChatbotFlow',
    inputSchema: AiCustomerSupportChatbotInputSchema,
    outputSchema: AiCustomerSupportChatbotOutputSchema,
  },
  async input => {
    const {output} = await aiCustomerSupportChatbotPrompt(input);
    return output!;
  }
);
