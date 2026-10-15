import Ajv2020 from "ajv/dist/2020";
import orderCreatedSchema from "./order-created.schema.json";

const ajv = new Ajv2020({ allErrors: true });
const validateOrderCreated = ajv.compile(orderCreatedSchema);

export function assertOrderCreatedContract(event: unknown): void {
  if (!validateOrderCreated(event)) {
    throw new Error(`Invalid OrderCreated event: ${ajv.errorsText(validateOrderCreated.errors)}`);
  }
}
