import { inngest } from './client.js';
import { auditLogs } from '../store.js';

export const onTodoCreated = inngest.createFunction(
    {
        id: 'on-todo-created',
        triggers: [{ event: "todo/created" }],
    },
    async({ event, step }) => {
        await step.run("audit", async () => {
            auditLogs.push({
                action: "created",
                todoId: event.data.todo.id,
                title: event.data.todo.title,
                timestamp: new Date().toISOString(),
            });
        });

        return { ok: true };
    }   
);

export const onTodoDeleted = inngest.createFunction(
    {
        id: 'on-todo-deleted',
        retries: 2,
        triggers: [{ event: "todo/deleted" }],
    },
    async({ event, step, attempt }) => {
        const id = event.data.todo.id;

        await step.run("cleanup", () => {
            if(attempt === 0) {
                //simulate failure on first attempt
                throw new Error(`Failed to cleanup after deleting todo ${id}`)
            }
            return "cleaned";
        });

        await step.run("audit", () => {
            auditLogs.push({
                action: "delted",
                todoId: id,
            });

            return { ok: true };
        });
    }
);

//npx inngest-cli@latest dev