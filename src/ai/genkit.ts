import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Polyfill for fetch in Node.js environment
if (typeof fetch !== 'function') {
  import('node-fetch').then(({default: nodeFetch}) => {
    (global as any).fetch = nodeFetch;
  });
}

export const ai = genkit({
  plugins: [googleAI()],
  // This model is suitable for vision and text tasks.
  model: 'googleai/gemini-1.5-pro-001',
});
