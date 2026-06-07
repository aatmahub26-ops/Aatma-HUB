import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview Central Genkit Intelligence Node for Aatma HUB.
 * Configured for high-velocity response generation using Gemini 2.0 Flash.
 * Explicitly loads GEMINI_API_KEY to ensure backend connectivity.
 */

export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY 
    })
  ],
  // Standardized model name to resolve 404 errors on v1beta endpoints
  // Upgraded to Gemini 2.0 Flash for superior performance and stability
  model: 'googleai/gemini-2.0-flash',
});
