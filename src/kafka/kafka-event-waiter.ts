import type { Consumer, KafkaMessage } from "kafkajs";
import { kafka, newConsumerGroup } from "./kafka.factory";

export interface ObservedEvent<T> {
  topic: string;
  partition: number;
  offset: string;
  key: string | null;
  value: T;
  correlationId?: string;
}

export interface EventWaitOptions {
  timeoutMs?: number;
  fromBeginning?: boolean;
}

/**
 * Waits for a matching event on a topic.
 * For deterministic use, start the waiter before triggering the event.
 * Shared-topic tests must filter by unique correlation/event IDs.
 */
export async function waitForEvent<T>(
  topic: string,
  matches: (event: ObservedEvent<T>) => boolean,
  options: EventWaitOptions = {}
): Promise<ObservedEvent<T>> {
  const timeoutMs = options.timeoutMs ?? 15000;
  const consumer: Consumer = kafka.consumer({ groupId: newConsumerGroup() });

  await consumer.connect();

  let timer: NodeJS.Timeout | undefined;
  let settled = false;
  let resolveResult!: (event: ObservedEvent<T>) => void;
  let rejectResult!: (error: Error) => void;

  const result = new Promise<ObservedEvent<T>>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  const finish = (error?: Error, event?: ObservedEvent<T>) => {
    if (settled) return;
    settled = true;
    if (timer) clearTimeout(timer);
    if (error) rejectResult(error);
    else if (event) resolveResult(event);
    else rejectResult(new Error("Event waiter settled without a result"));
  };

  try {
    await consumer.subscribe({
      topic,
      fromBeginning: options.fromBeginning ?? false
    });

    timer = setTimeout(() => {
      finish(new Error(`Timed out after ${timeoutMs}ms waiting for event on ${topic}`));
    }, timeoutMs);

    // Wait for group assignment before returning control to the test.
    // This prevents a fast API action from publishing before the consumer
    // is ready to fetch. Keep the waiter subscribed before triggering work.
    const groupJoined = new Promise<void>((resolve, reject) => {
      const onGroupJoin = () => {
        consumer.off(consumer.events.GROUP_JOIN, onGroupJoin);
        resolve();
      };
      consumer.on(consumer.events.GROUP_JOIN, onGroupJoin);
      consumer.on(consumer.events.CRASH, event => {
        reject(event.payload.error);
      });
    });

    void consumer.run({
      eachMessage: async ({ topic: messageTopic, partition, message }) => {
        if (!message.value || settled) return;

        let value: T;
        try {
          value = JSON.parse(message.value.toString()) as T;
        } catch {
          // Keep waiting, but malformed messages should also be surfaced
          // by broker/service diagnostics in a production implementation.
          return;
        }

        const event: ObservedEvent<T> = {
          topic: messageTopic,
          partition,
          offset: message.offset,
          key: message.key?.toString() ?? null,
          value,
          correlationId: headerToString(message, "correlationId")
        };

        if (matches(event)) finish(undefined, event);
      }
    }).catch((error: unknown) => {
      finish(error instanceof Error ? error : new Error(String(error)));
    });

    await groupJoined;
    return await result;
  } finally {
    if (timer) clearTimeout(timer);
    try {
      await consumer.stop();
    } catch {
      // Consumer may not have entered RUNNING state.
    }
    await consumer.disconnect();
  }
}

function headerToString(message: KafkaMessage, name: string): string | undefined {
  const header = message.headers?.[name];
  if (header === undefined) return undefined;
  return Buffer.isBuffer(header) ? header.toString() : String(header);
}
