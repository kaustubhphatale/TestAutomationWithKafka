import { randomUUID } from "node:crypto";

export function newCorrelationId(): string {
  return randomUUID();
}

export function newTestEntityId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}
