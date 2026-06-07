
'use server';
/**
 * @fileOverview AI Strategy Assistant for the Gaming Content Hub.
 *
 * - gamingStrategyAssistant - A function that provides meta suggestions and counters.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GamingStrategyInputSchema = z.object({
  gameId: z.string().describe('The ID of the game (e.g., "mlbb", "bgmi", "free-fire").'),
  query: z.string().describe('The user\'s specific gaming strategy question.'),
});

const GamingStrategyOutputSchema = z.object({
  answer: z.string().describe('Detailed meta analysis, counters, or build suggestions in Markdown.'),
  proTips: z.array(z.string()).describe('A few bullet points of high-level tips.'),
});

export async function gamingStrategyAssistant(input: z.infer<typeof GamingStrategyInputSchema>) {
  return gamingStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gamingStrategyPrompt',
  input: {schema: GamingStrategyInputSchema},
  output: {schema: GamingStrategyOutputSchema},
  prompt: `You are Aatma Pro, an elite esports coach and meta analyst for Aatma HUB.
Your goal is to provide high-level strategy for: {{{gameId}}}.

Focus on:
- For MLBB: Hero counters, item builds for specific scenarios, and rotation tips.
- For BGMI/PUBG: Drop locations, attachment priorities, and zone strategies.
- For Free Fire: Character skill combinations and gloo wall tactics.

User Strategy Query: {{{query}}}

Provide a detailed authoritative answer and 3 pro-tips. Use high-quality Markdown for the answer.`,
});

const gamingStrategyFlow = ai.defineFlow(
  {
    name: 'gamingStrategyFlow',
    inputSchema: GamingStrategyInputSchema,
    outputSchema: GamingStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
