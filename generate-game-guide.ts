
'use server';
/**
 * @fileOverview An AI flow to generate professional gaming guides, hero builds, and item builds.
 *
 * - generateGameGuide - A function that handles the generation of game guides.
 * - GenerateGameGuideInput - The input type for the generateGameGuide function.
 * - GenerateGameGuideOutput - The return type for the generateGameGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGameGuideInputSchema = z.object({
  gameTitle: z.string().describe('The title of the game (e.g., "Mobile Legends", "BGMI").'),
  category: z.enum(['Guide', 'News', 'Leaks', 'Build', 'Patch']).describe('The category of the content.'),
  topic: z.string().describe('The specific hero, item, or news topic.'),
  additionalDetails: z.string().optional().describe('Any extra context or specific things to mention.'),
});
export type GenerateGameGuideInput = z.infer<typeof GenerateGameGuideInputSchema>;

const GenerateGameGuideOutputSchema = z.object({
  title: z.string().describe('A catchy, SEO-friendly headline.'),
  content: z.string().describe('The full article content in Markdown format.'),
  tags: z.array(z.string()).describe('Suggested tags for the article.'),
});
export type GenerateGameGuideOutput = z.infer<typeof GenerateGameGuideOutputSchema>;

export async function generateGameGuide(input: GenerateGameGuideInput): Promise<GenerateGameGuideOutput> {
  return generateGameGuideFlow(input);
}

const guidePrompt = ai.definePrompt({
  name: 'generateGameGuidePrompt',
  input: {schema: GenerateGameGuideInputSchema},
  output: {schema: GenerateGameGuideOutputSchema},
  prompt: `You are an expert gaming journalist and pro-player for Aatma HUB, a premier esports community. 
Your goal is to write high-quality, professional, and engaging content for the community hub.

Content Category: {{{category}}}
Game: {{{gameTitle}}}
Specific Topic: {{{topic}}}
{{#if additionalDetails}}Extra Context: {{{additionalDetails}}}{{/if}}

Please generate a detailed, authoritative, and well-structured article. 
- For "Build" categories, include specific hero/item combinations, skill leveling order, and playstyle tips.
- For "Leaks" categories, maintain an exciting and speculative tone.
- For "Patch" categories, explain the meta shift clearly.
- For "Guide" categories, provide step-by-step instructions.

The content MUST be in high-quality Markdown.`,
});

const generateGameGuideFlow = ai.defineFlow(
  {
    name: 'generateGameGuideFlow',
    inputSchema: GenerateGameGuideInputSchema,
    outputSchema: GenerateGameGuideOutputSchema,
  },
  async input => {
    const {output} = await guidePrompt(input);
    return output!;
  }
);
