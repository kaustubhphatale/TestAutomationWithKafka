import { test as base } from "@playwright/test";
import { OrderApiClient } from "../clients/order-api.client";

type Fixtures = { orderApi: OrderApiClient };

export const test = base.extend<Fixtures>({
  orderApi: async ({ request }, use) => {
    await use(new OrderApiClient(request));
  }
});

export { expect } from "@playwright/test";
