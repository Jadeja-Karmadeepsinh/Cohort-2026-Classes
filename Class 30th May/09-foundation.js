import { checkOpenAI } from './01-foundation.js';
import { calculator, calculateTool } from './tools/calculator.js';

const client = await checkOpenAI();

const model = "openrouter/free";

console.log(client.baseURL);

const tools = [calculateTool];

const messages = [
    {
        role: "system",
        content: "You are a helpful assistant that can perform calculations using the provided calculator tool.",
    },
    {
        role: "user",
        content: "what is result of adding 69 with 96",
    }
];

const firstResponse = await client.chat.completions.create({
    model: model,
    messages: messages,
    tool_choice: "auto", //this is to choose tool that is required from all available tools
    tools: tools,
});

console.log("++++++++++ First Response: ++++++++++");

const assistantMessage = firstResponse.choices[0].message;
// console.log("MESSAGE OBJ: ", assistantMessage);
console.log("TOOL CALLS: ", assistantMessage.tool_calls);
console.log("CONTENT: ", assistantMessage.content);

messages.push(assistantMessage);

if(assistantMessage.tool_calls) {
    // for(const tool_call of assistantMessage.tool_calls) {
    //     const toolName = tool_call.function.name;
    //     const toolArgs = tool_call.function.arguments;
    // }

    const toolCall = assistantMessage.tool_calls[0];
    const toolArgs = JSON.parse(toolCall.function.arguments);
    const toolResponse = calculator(toolArgs);

    console.log("++++++++++ Tool Response: ++++++++++");
    console.log(toolResponse);

    messages.push({
        role: "tool",
        // name: toolCall.function.name, we pass tool call it not name
        tool_call_id: toolCall.id,
        content: String(toolResponse), //we need to pass the response from tool in string
    });
}

const secondResponse = await client.chat.completions.create({
    model: model,
    messages: messages,
    tool_choice: "auto",
    tools: tools,
});

console.log("++++++++++ Second Response: ++++++++++");
console.log("ANSWER: ",secondResponse.choices[0].message.content);