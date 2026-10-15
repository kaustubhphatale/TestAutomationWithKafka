import { randomUUID } from "node:crypto";
import { test, expect } from "../../src/fixtures/test.fixture";
import { waitUntil } from "../../src/utils/polling";

test("order reaches the expected final business state", async ({ orderApi }) => {
  test.skip(!process.env.RUN_APPLICATION_E2E,
    "Set RUN_APPLICATION_E2E=true after configuring the target application.");

  const correlationId = randomUUID();
  const response = await orderApi.createOrder(
    `customer-${randomUUID()}`, 125.5, correlationId
  );

  expect(response.status()).toBe(201);
  const { orderId } = await response.json();

  const order = await waitUntil(async () => {
    const result = await orderApi.getOrder(orderId);
    if (result.status() !== 200) {
      throw new Error(`Order lookup returned ${result.status()}`);
    }
    return result.json();
  }, value => value.status === "CONFIRMED", 20000, 300);

  expect(order.orderId).toBe(orderId);
  expect(order.status).toBe("CONFIRMED");
});
