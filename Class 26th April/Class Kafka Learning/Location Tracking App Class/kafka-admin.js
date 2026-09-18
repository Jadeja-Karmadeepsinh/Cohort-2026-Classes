import { kafkaClient } from "./kafka-client.js";

async function setUp() {
    const admin = kafkaClient.admin();
    console.log("Admin is connecting........");
    await admin.connect();
    console.log("Admin is connected........");

    await admin.createTopics({
        topics: [
            {
                topic: 'location-updates',
                numPartitions: 2
            },
        ]
    });

    await admin.disconnect();
}

setUp();