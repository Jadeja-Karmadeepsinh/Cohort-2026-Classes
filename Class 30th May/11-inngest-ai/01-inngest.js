import { inngest } from './inngest-client.js';

export const onOrderPlaced = inngest.createFunction(
    {
        id: "on-order-placed",
        retries: 2,
        triggers: [{ event: "order/placed" }],
    },
    async ({ event, step }) => {
        const { orderId, customer } = event.data;

        const greetings = await step.run("greet", async () => {
            return `Hello ${customer.name}! Thanks for your order ${orderId}`;
        });

        await step.run("log-greetings", async () => {
            console.log(greetings);
        });

        return { ok: true, greetings: greetings };
    }
);