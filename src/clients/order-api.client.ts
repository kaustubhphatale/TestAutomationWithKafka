import type { APIRequestContext } from "@playwright/test";

export class OrderApiClient {
  constructor(private readonly request: APIRequestContext) {}

  createOrder(customerId: string, amount: number, correlationId: string) {
    return this.request.post("/orders", {
      data: { customerId, amount },
      headers: { "x-correlation-id": correlationId }
    });
  }

  getOrder(orderId: string) {
    return this.request.get(`/orders/${encodeURIComponent(orderId)}`);
  }
}
