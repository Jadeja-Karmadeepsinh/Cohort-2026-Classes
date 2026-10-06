import { checkOpenAI } from './01-foundation.js';

const client = await checkOpenAI();

const model = "openrouter/free";

console.log(client.baseURL);

async function askQuestion(systemPrompt, userPrompt) {
    const response = await client.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: systemPrompt,
            }, 
            {
                role: "user",
                content: userPrompt,
            }
        ],
    });
    
    // console.log(response.choices[0].message);
    return response.choices[0].message.content;
}

const userQuestion = "My name is dickens, tell me a 1 line joke";

// const friendlyResponse = await askQuestion("You are a friendly customer service agent who loves to help customers with their food orders. You are always polite and eager to assist.", userQuestion);

// console.log("++++++++++ Friendly response: ++++++++++");
// console.log(friendlyResponse);


// const formal = await askQuestion(
//     "You are a formal customer support agent for a food delivery service. You always respond in a professional and courteous manner, providing clear and concise information to customers about their orders.",
//     userQuestion,
// );
  
// console.log("++++++++++ Formal response: ++++++++++");
// console.log(formal);
  
const rude = await askQuestion(
    "You always respond in 1 line",
    userQuestion,
);
  
console.log("++++++++++ Rude response: ++++++++++");
console.log(rude);

const userQuestion2 = "Tell me my Name";

const formal = await askQuestion("You always respond in 1 line", userQuestion2);

console.log("++++++++++ Formal response: ++++++++++");
console.log(formal);
