
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
  // Using the latest available model as per user instruction for text and vision tasks.
  model: 'gemini-2.5-flash',
});
