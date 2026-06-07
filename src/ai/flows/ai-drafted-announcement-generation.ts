'use server';
/**
 * @fileOverview An AI assistant for drafting various types of announcements for the Aatma HUB platform.
 *
 * - aiDraftedAnnouncementGeneration - A function that handles the generation of announcement drafts.
 * - AiDraftedAnnouncementGenerationInput - The input type for the aiDraftedAnnouncementGeneration function.
 * - AiDraftedAnnouncementGenerationOutput - The return type for the aiDraftedAnnouncementGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDraftedAnnouncementGenerationInputSchema = z.object({
  announcementType: z
    .enum(['New Game', 'Promotion', 'System Update', 'Event', 'Other'])
    .describe('The type of announcement to draft.'),
  title: z.string().describe('A concise title or headline for the announcement.'),
  keyDetails: z.string().describe('Key information and details to include in the announcement.'),
  callToAction: z
    .string()
    .optional()
    .describe(
      'An optional call to action for the announcement (e.g., "Check out now!", "Update your app!").'
    ),
  targetAudience: z
    .string()
    .optional()
    .describe(
      'An optional description of the target audience for this announcement (e.g., "all users", "new players", "Valorant fans").'
    ),
  tone: z
    .enum(['Formal', 'Excited', 'Informative', 'Urgent', 'Casual'])
    .optional()
    .describe('The desired tone for the announcement.'),
});
export type AiDraftedAnnouncementGenerationInput = z.infer<
  typeof AiDraftedAnnouncementGenerationInputSchema
>;

const AiDraftedAnnouncementGenerationOutputSchema = z.object({
  draftedAnnouncement: z
    .string()
    .describe('The AI-generated announcement text, suitable for Aatma HUB users.'),
});
export type AiDraftedAnnouncementGenerationOutput = z.infer<
  typeof AiDraftedAnnouncementGenerationOutputSchema
>;

export async function aiDraftedAnnouncementGeneration(
  input: AiDraftedAnnouncementGenerationInput
): Promise<AiDraftedAnnouncementGenerationOutput> {
  return aiDraftedAnnouncementGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftAnnouncementPrompt',
  input: {schema: AiDraftedAnnouncementGenerationInputSchema},
  output: {schema: AiDraftedAnnouncementGenerationOutputSchema},
  prompt: `You are an expert marketing copywriter for Aatma HUB, a gaming commerce platform with a dark gaming theme and professional esports style UI. Your goal is to create clear, engaging, and consistent announcement messages for users.

Draft an announcement based on the following details:

Announcement Type: {{{announcementType}}}
Title: {{{title}}}
Key Details: {{{keyDetails}}}

{{#if callToAction}}
Call to Action: {{{callToAction}}}
{{/if}}

{{#if targetAudience}}
Target Audience: {{{targetAudience}}}
{{/if}}

{{#if tone}}
Tone: {{{tone}}}
{{/if}}

Make sure the announcement is concise, engaging, and professional, fitting the Aatma HUB brand. Ensure important details are highlighted.`,
});

const aiDraftedAnnouncementGenerationFlow = ai.defineFlow(
  {
    name: 'aiDraftedAnnouncementGenerationFlow',
    inputSchema: AiDraftedAnnouncementGenerationInputSchema,
    outputSchema: AiDraftedAnnouncementGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
