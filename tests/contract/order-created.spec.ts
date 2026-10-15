import { test, expect } from "@playwright/test";
import { assertOrderCreatedContract } from "../../src/contracts/validate-event";

test("sample OrderCreated event conforms to its schema", () => {
  const event = {
    eventId: "event-123",
    eventType: "OrderCreated",
    schemaVersion: 1,
    orderId: "order-123",
    customerId: "customer-123",
    amount: 125.5
  };

  expect(() => assertOrderCreatedContract(event)).not.toThrow();
});

test("sample OrderCreated contract rejects a non-positive amount", () => {
  const event = {
    eventId: "event-123",
    eventType: "OrderCreated",
    schemaVersion: 1,
    orderId: "order-123",
    customerId: "customer-123",
    amount: 0
  };

  expect(() => assertOrderCreatedContract(event)).toThrow();
});
