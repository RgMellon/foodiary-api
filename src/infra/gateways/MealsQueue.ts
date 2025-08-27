import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { Injectable } from "@kernel/decorators/Injectable";
import { AppConfig } from "src/shared/config/AppConfig";
import { sqsClient } from "../client/SQSClient";

@Injectable()
export class MealsQueue {
    constructor(private readonly appConfig: AppConfig) {}

    async publish(message: MealsQueue.Message) {
        const command = new SendMessageCommand({
            QueueUrl: this.appConfig.mealsQueue.mealsQueueUrl,
            MessageBody: JSON.stringify(message),
        });

        console.log("publish");
        await sqsClient.send(command);
    }
}

export namespace MealsQueue {
    export type Message = {
        accountId: string;
        mealId: string;
    };
}
