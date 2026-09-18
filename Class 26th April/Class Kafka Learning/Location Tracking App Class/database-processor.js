import { kafkaClient } from "./kafka-client.js";

async function init() {
    const kafkaConsumer = kafkaClient.consumer({ groupId: "database-processor" });
    await kafkaConsumer.connect();

    await kafkaConsumer.subscribe({
        topics: ["location-updates"],
        fromBeginning: true
    });

    kafkaConsumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat }) => {
            const data = JSON.parse(message.value.toString());
            console.log(`Kafaka database consumer data received: `, { data });
            heartbeat();
        }
    })
}

init();