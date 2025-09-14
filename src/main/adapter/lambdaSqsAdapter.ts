import { Registry } from "@kernel/di/Registry";
import { SQSHandler } from "aws-lambda";
import { IQueueConsumer } from "src/contracts/IQueueConsumer";
import { Constructor } from "src/shared/types/constructor";

export function lambdaSqsAdapter(
    consumerImpl: Constructor<IQueueConsumer<any>>
): SQSHandler {
    const consumer = Registry.getInstance().resolve(consumerImpl);

    return async (event) => {
        await Promise.all(
            event.Records.map(async (record) => {
                const message = JSON.parse(record.body);

                await consumer.process(message);
            })
        );
    };
}
