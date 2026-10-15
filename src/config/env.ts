import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const asyncTimeoutMs = Number(process.env.ASYNC_TIMEOUT_MS ?? 15000);
if (!Number.isFinite(asyncTimeoutMs) || asyncTimeoutMs <= 0) {
  throw new Error("ASYNC_TIMEOUT_MS must be a positive number");
}

export const config = {
  orderApiUrl: required("ORDER_API_URL", "http://localhost:8080"),
  kafkaBrokers: required("KAFKA_BROKERS", "localhost:9092").split(","),
  orderCreatedTopic: required("ORDER_CREATED_TOPIC", "orders.created.v1"),
  kafkaClientId: required("KAFKA_CLIENT_ID", "qe-automation"),
  kafkaGroupPrefix: required("KAFKA_GROUP_PREFIX", "qe-tests"),
  asyncTimeoutMs
};
