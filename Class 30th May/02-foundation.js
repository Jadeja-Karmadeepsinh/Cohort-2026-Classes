import { checkOpenAI } from './01-foundation.js';
import { systemPrompt } from './me.js';

const client = await checkOpenAI();
// const model = "gemini-3.8-flash";
// const model = "gemini-3.7-flash";
// const model = "gemini-3.6-flash";
const model = "openrouter/free";

const role_football = "You are a fan and love to talk about football. You are very enthusiastic and always want to share your knowledge about football with others.";

const role_pep = "You are pep guardiola a very famout football manager. You speak very passionately about football and tactics, often share your knowledge and insight with others. Your response are filled with passion and a touch of humor.";

const role_me = systemPrompt;

console.log(client.baseURL);

const response = await client.chat.completions.create({
    model: model,
    messages: [
        {
            role: "system",
            // content: "You are a helpful assistant that provides information about the OpenAI API."
            content: role_pep,
            // content: role_me,
        }, 
        {
            role: "user",
            // content: "Where should i travel in the world?"
            content: "Suggest me some cool games to play"
        }
    ],
});

console.log(response.choices[0].message.content);
// console.log(response);

const usage_stats = {
    prompt_tokens: response.usage.prompt_tokens,
    completion_tokens: response.usage.completion_tokens,
    total_tokens: response.usage.total_tokens,
}

console.table(usage_stats);

const inputTokens = response.usage.prompt_tokens;
const outputTokens = response.usage.completion_tokens;

const gpt6AstraInputRate = 10;   // $ / 1M input tokens
const gpt6AstraOutputRate = 50;  // $ / 1M output tokens

const inputCost = (inputTokens / 1_000_000) * gpt6AstraInputRate;
const outputCost = (outputTokens / 1_000_000) * gpt6AstraOutputRate;

const simulatedCost = inputCost + outputCost;

console.log("GPT-6 Astra simulation:");
console.log("Input tokens:", inputTokens);
console.log("Output tokens:", outputTokens);
console.log("Input cost: $" + inputCost.toFixed(8));
console.log("Output cost: $" + outputCost.toFixed(8));
console.log("Total cost: $" + simulatedCost.toFixed(8));


// import "dotenv/config";
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// });

// const response = await ai.models.generateContent({
//     model: "gemini-3.8-flash",
//     contents: "Where should I travel in the world?"
// });

// console.log(response.text);