import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-transcript.ts';
import '@/ai/flows/refine-generated-summary.ts';
import '@/ai/flows/customize-summary-with-prompt.ts';