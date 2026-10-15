import { randomUUID } from "node:crypto";
import { test, expect } from "../../src/fixtures/test.fixture";
import { config } from "../../src/config/env";
import { waitForEvent } from "../../src/kafka/kafka-event-waiter";
import { assertOrderCreatedContract } from "../../src/contracts/validate-event";

test("creating an order emits a matching OrderCreated event", async ({ orderApi }) => {
  const correlationId = randomUUID();
  const customerId = `customer-${randomUUID()}`;

  // Start the waiter before the API call. The target service must propagate
  // x-correlation-id to the Kafka message header for this example to match.
  const eventPromise = waitForEvent<Record<string, unknown>>(
    config.orderCreatedTopic,
    event => event.correlationId === correlationId,
    { timeoutMs: config.asyncTimeoutMs }
  );

  const response = await orderApi.createOrder(customerId, 125.5, correlationId);
  expect([200, 201, 202]).toContain(response.status());

  const body = await response.json();
  expect(body.orderId).toBeTruthy();

  const event = await eventPromise;
  assertOrderCreatedContract(event.value);
  expect(event.value.customerId).toBe(customerId);
  expect(event.value.orderId).toBe(body.orderId);
  expect(event.value.amount).toBe(125.5);
});
