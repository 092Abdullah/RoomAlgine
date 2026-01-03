
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';
config();

// Polyfill for fetch in Node.js environment
if (typeof fetch !== 'function') {
  import('node-fetch').then(({default: nodeFetch}) => {
    (global as any).fetch = nodeFetch;
  });
}

export const ai = genkit({
  plugins: [googleAI()],
  // This model is suitable for vision and text tasks and is known to be available.
  model: 'gemini-1.5-flash',
});
