import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // This model is suitable for vision and text tasks.
  model: 'googleai/gemini-1.5-pro-latest',
});
