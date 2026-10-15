import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { KafkaTestProducer } from "../../src/kafka/kafka-producer";
import { waitForEvent } from "../../src/kafka/kafka-event-waiter";

test("Payment Service processes PaymentRequested", async () => {
  const producer = new KafkaTestProducer();
  const correlationId = randomUUID();
  const orderId = `order-${randomUUID()}`;

  const resultPromise = waitForEvent<Record<string, unknown>>(
    "payments.completed.v1",
    event => event.correlationId === correlationId,
    { timeoutMs: 15000 }
  );

  try {
    await producer.connect();
    await producer.publish("payments.requested.v1", orderId, {
      eventId: randomUUID(),
      eventType: "PaymentRequested",
      schemaVersion: 1,
      orderId,
      amount: 125.5
    }, correlationId);

    const result = await resultPromise;
    expect(result.value.orderId).toBe(orderId);
    expect(result.value.eventType).toBe("PaymentCompleted");
  } finally {
    await producer.disconnect();
  }
});
