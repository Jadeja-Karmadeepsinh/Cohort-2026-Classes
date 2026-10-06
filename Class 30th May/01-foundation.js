import 'dotenv/config';

const API_KEY = process.env.OPENROUTER_API_KEY;

export const apiKeyChecker = () => {
    if(!API_KEY) {
        console.log('Error: No API Key Found');
        process.exit(1);
    }
}

export const checkOpenAI = async () => {
    //lazy load or import
    const openai = (await import('openai')).default;

    const client = new openai.OpenAI({
        apiKey: API_KEY,
        // baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        baseURL: "https://openrouter.ai/api/v1",
    });

    if(!client) {
        console.log('Error: Coundnt initialize client');
        process.exit(1);
    }
    console.log('Client Initialized.........');
    console.log('Base URL:', client.baseURL);
    return client;
}

const PORT = process.env.PORT;