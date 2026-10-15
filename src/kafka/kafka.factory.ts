import { Kafka } from "kafkajs";
import { randomUUID } from "node:crypto";
import { config } from "../config/env";

export const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers,
  connectionTimeout: 5000,
  requestTimeout: 10000,
  retry: { retries: 3 }
});

export function newConsumerGroup(): string {
  return `${config.kafkaGroupPrefix}-${randomUUID()}`;
}
