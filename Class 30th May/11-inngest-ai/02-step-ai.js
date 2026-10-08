import { inngest, openrouter } from './inngest-client.js';

export const summarizeThenTranslate = inngest.createFunction(
    {
        id: "summarize-then-translate",
        retries: 2,
        triggers: [{ event: "summarize/then/translate" }],
    },
    async ({ event, step }) => {
        const response = await step.ai.infer("summarize", 
            {
                model: openrouter,
                body: {
                    input: [
                        { role: "user", content: "Summarize the following text in 1 line: " + event.data.text } 
                    ],
                },
            }
        );

        // console.log(response);
        // console.log("First response output[0]: " + response.output[0]);
        console.log("First response output[0].content: " + response.output[0].content[0].text);
        // console.log("First response output[1]: " + response.output[1]);
        console.log("First response output[1].content: " + response.output[1].content[0].text);
        const summary = response.output[0].content[0].text;

        const translateResponse = await step.ai.infer("translate", 
            {
                model: openrouter,
                body: {
                    input: [
                        { role: "user", content: "Translate the following text in spanish: " + summary },
                    ],
                }
            }
        );

        // console.log(translateResponse);
        // console.log(translateResponse.output[0]);
        // console.log(translateResponse.output[0].content);
        // console.log(translateResponse.output[1]);
        // console.log(translateResponse.output[1].content);
        const translation = translateResponse.output[0].content[0].text;
        console.log(translation);
        return translation;
    }
);


/*

{
  "data": {
    "text": "i love you radhika, you are the best women i ever met, i just wish you change you mind and maybe one day you will realise that we both are meant to be toghter we are each other's male and female versions and i dont know what i can say but yeah you are the all i ever needed as a partner i just hope that please this time you accept my proposal and we can live our rest of life together with you i feel so happy thats why i just wish you change you decision i love you radhika"
  }
}

*/