import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({ apiKey: 'AIzaSyABkh4vWsUlu8tqyycYEQDi151lrVUV8h8' })],
  model: 'googleai/gemini-2.0-flash',
});
