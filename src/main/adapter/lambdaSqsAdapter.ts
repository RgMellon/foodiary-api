import { SQSHandler } from "aws-lambda";
import { IQueueConsumer } from "src/contracts/IQueueConsumer";

export function  lambdaSqsAdapter(consumer: IQueueConsumer<any>): SQSHandler {
    return async (event) => {
        await Promise.all(
            event.Records.map(async (record) => {
                const message = JSON.parse(record.body);

                await consumer.process(message);
            })
        );
    };
}
