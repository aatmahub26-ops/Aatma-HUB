'use server';
/**
 * @fileOverview This file provides an AI assistant to generate high-quality, engaging product descriptions and package details
 * for game listings on the Aatma HUB platform. It helps admins quickly enrich the catalog without extensive manual writing.
 *
 * - generateProductDescription: A function that triggers the AI-driven description generation process.
 * - AiAssistedProductDescriptionGenerationInput: The input type for the generateProductDescription function.
 * - AiAssistedProductDescriptionGenerationOutput: The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAssistedProductDescriptionGenerationInputSchema = z.object({
  gameTitle: z.string().describe('The title of the game (e.g., "Mobile Legends: Bang Bang").'),
  productType: z.string().describe('The type of product package (e.g., "Diamond Package", "Battle Pass").'),
  keyFeatures: z
    .string()
    .describe('Comma-separated key features of the product (e.g., "1000 Diamonds, Instant Delivery, Bonus Skins").'),
  targetAudience: z.string().optional().describe('Optional: The target audience for this product (e.g., "Competitive players, Casual gamers").'),
  existingDescription: z.string().optional().describe('Optional: An existing description to be refined or expanded upon.'),
});
export type AiAssistedProductDescriptionGenerationInput = z.infer<
  typeof AiAssistedProductDescriptionGenerationInputSchema
>;

const AiAssistedProductDescriptionGenerationOutputSchema = z.object({
  productDescription: z
    .string()
    .describe('A high-quality, engaging product description suitable for a gaming commerce platform.'),
  packageDetails: z.string().describe('Detailed information and specifics about the product package.'),
  marketingKeywords: z.array(z.string()).describe('A list of suggested keywords for marketing and SEO.'),
});
export type AiAssistedProductDescriptionGenerationOutput = z.infer<
  typeof AiAssistedProductDescriptionGenerationOutputSchema
>;

export async function generateProductDescription(
  input: AiAssistedProductDescriptionGenerationInput
): Promise<AiAssistedProductDescriptionGenerationOutput> {
  return aiAssistedProductDescriptionGenerationFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: AiAssistedProductDescriptionGenerationInputSchema},
  output: {schema: AiAssistedProductDescriptionGenerationOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in gaming products for an esports commerce platform named "Aatma HUB". Your goal is to create compelling, high-quality, and informative descriptions for game products. Focus on excitement, professionalism, and appeal to a gamer audience.

Game: {{{gameTitle}}}
Product Type: {{{productType}}}
Key Features: {{{keyFeatures}}}
{{#if targetAudience}}Target Audience: {{{targetAudience}}}{{/if}}
{{#if existingDescription}}Existing Description (for refinement/expansion): {{{existingDescription}}}{{/if}}

Please generate a concise, engaging product description, detailed package specifics, and a list of relevant marketing keywords based on the information provided.`,
});

const aiAssistedProductDescriptionGenerationFlow = ai.defineFlow(
  {
    name: 'aiAssistedProductDescriptionGenerationFlow',
    inputSchema: AiAssistedProductDescriptionGenerationInputSchema,
    outputSchema: AiAssistedProductDescriptionGenerationOutputSchema,
  },
  async input => {
    const {output} = await productDescriptionPrompt(input);
    return output!;
  }
);
