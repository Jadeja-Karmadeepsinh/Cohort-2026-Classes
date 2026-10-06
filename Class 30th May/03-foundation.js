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

const userQuestion = "Where is my food order?";

const friendlyResponse = await askQuestion("You are a friendly customer service agent who loves to help customers with their food orders. You are always polite and eager to assist.", userQuestion);

console.log("++++++++++ Friendly response: ++++++++++");
console.log(friendlyResponse);


const formal = await askQuestion(
    "You are a formal customer support agent for a food delivery service. You always respond in a professional and courteous manner, providing clear and concise information to customers about their orders.",
    userQuestion,
);
  
console.log("++++++++++ Formal response: ++++++++++");
console.log(formal);
  
const rude = await askQuestion(
    "You are a rude customer support agent for a food delivery service. You respond in a curt and unhelpful manner, often providing vague or dismissive answers to customers about their orders.",
    userQuestion,
);
  
console.log("++++++++++ Rude response: ++++++++++");
console.log(rude);







// const response = await client.chat.completions.create({
//     model: model,
//     messages: [
//         {
//             role: "system",
//             content: "",
//         }, 
//         {
//             role: "user",
//             content: "",
//         }
//     ],
// });

// console.log(response.choices[0].message);
// console.log(response.choices[0].message.content);