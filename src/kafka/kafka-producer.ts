import type { Producer } from "kafkajs";
import { kafka } from "./kafka.factory";

export class KafkaTestProducer {
  private readonly producer: Producer;

  constructor() {
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async publish(
    topic: string,
    key: string,
    payload: Record<string, unknown>,
    correlationId: string
  ): Promise<void> {
    await this.producer.send({
      topic,
      acks: -1,
      messages: [{
        key,
        value: JSON.stringify(payload),
        headers: { correlationId }
      }]
    });
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
}
