import { Kafka } from "kafkajs";

export const kafkaClient = new Kafka({
    clientId: "karma",
    brokers: ["localhost:9092"]
});