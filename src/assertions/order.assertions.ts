import { expect } from "@playwright/test";

export function expectOrderCreatedEvent(
  event: Record<string, unknown>,
  expected: { orderId: string; customerId: string; amount: number }
): void {
  expect(event.eventType).toBe("OrderCreated");
  expect(event.orderId).toBe(expected.orderId);
  expect(event.customerId).toBe(expected.customerId);
  expect(event.amount).toBe(expected.amount);
}
