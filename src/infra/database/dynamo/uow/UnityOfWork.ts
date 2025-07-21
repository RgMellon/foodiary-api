import {
    PutCommandInput,
    TransactWriteCommand,
    TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { DynamoClient } from "src/infra/client/DynamoClient";

export abstract class UnityOfWork {
    private transactionItems: NonNullable<
        TransactWriteCommandInput["TransactItems"]
    > = [];

    protected addPut(putInput: PutCommandInput) {
        this.transactionItems?.push({
            Put: putInput,
        });
    }

    protected async commit() {
        const command = new TransactWriteCommand({
            TransactItems: this.transactionItems,
        });

        await DynamoClient.send(command);
    }
}
