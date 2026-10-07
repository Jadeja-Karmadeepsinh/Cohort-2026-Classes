import { checkOpenAI } from './01-foundation.js';
import readline from 'readline';

const client = await checkOpenAI();

const model = "openrouter/free";

console.log(client.baseURL);

const conversations = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const systemPrompt = "You are a helpful assistant that responds in 5 line.";

function askQuestion(userPrompt) {
    return new Promise((resolve) => {
        rl.question(userPrompt, (answer) => {
            resolve(answer);
        })
    });
}

// rl.question("Who are you? ", (answer) => {
//     console.log(answer);
// })

// askQuestion("You: ");

while(true) {
    const userPrompt = await askQuestion("Ask question to AI: ");

    if(userPrompt.toLowerCase() === "exit") {
        console.log("Exiting....");
        rl.close();
        process.exit(0);
    }

    process.on('SIGINT', () => { //SIGINT = Signal Interrupt. Ctrl+C
        console.log("Exiting....");
        rl.close();
        process.exit(0);
    });

    const stream = await client.chat.completions.create({
        model: model,
        stream: true,
        messages: [
            {
                role: "system",
                content: systemPrompt,
            }, 
            ...conversations,
            {
                role: "user",
                content: userPrompt,
            }
        ],
    });

    process.stdout.write("AI Bot: ");

    let response = "";

    for await (const message of stream) {
        const delta = message.choices[0].delta.content;

        if(delta) {
            process.stdout.write(delta);
            response += delta;
            // console.log(response);
        }
    }
    conversations.push({ role: "user", content: userPrompt });
    // console.log("USER PROMPT IN HISTORY: ", userPrompt);
    conversations.push({ role: "assistant", content: response });
    // console.log("AI RESPONSE IN HISTORY: ", response);
    console.log("\n");
}

rl.close();