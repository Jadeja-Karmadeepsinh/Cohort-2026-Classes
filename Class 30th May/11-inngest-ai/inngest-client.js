import 'dotenv/config';
import { Inngest } from 'inngest';
import { openaiResponses } from '@inngest/ai/models';

export const inngest = new Inngest({
    id: 'inngest-ai-client',
});

export const openrouter = openaiResponses({
    model: "openrouter/free",
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: "https://openrouter.ai/api/v1"
});