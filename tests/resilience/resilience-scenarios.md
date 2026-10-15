# Resilience Test Scenarios

These are implementation scenarios, not claims that the target system already supports every behavior. Align them with the actual retry, DLQ, ordering, and idempotency design.

| Scenario | Injection | Assertions |
|---|---|---|
| Duplicate delivery | Publish same business event ID twice | One intended business effect |
| Invalid payload | Publish malformed or schema-invalid event | Documented rejection/error/DLQ behavior |
| Transient dependency failure | Return controlled errors from a dependency | Retry limit and backoff respected |
| Consumer restart | Restart during processing | Business outcome eventually completes; duplicates safe |
| Broker restart | Restart isolated test broker | Producer and consumer recover within agreed SLO |
| Out-of-order event | Deliver events in invalid sequence | State machine remains valid or safely rejects |
| DLQ replay | Replay a known failed message | Successful recovery without duplicate side effects |
| Load/backpressure | Produce a controlled burst | Throughput, lag and processing latency meet SLO |

## Design notes

- Use an isolated broker or dedicated test topics for destructive tests.
- Preserve event IDs when simulating duplicate delivery.
- Validate the business side effect, not only the number of output messages.
- Capture topic, partition, offset, correlation ID and service trace identifiers.
- Avoid fixed sleeps; wait for a condition with a bounded deadline.
- Never trigger irreversible financial or external operations in production.
