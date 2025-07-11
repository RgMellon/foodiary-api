import { Account } from "@application/entities/Account";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@kernel/decorators/Injectable";
import { DynamoClient } from "src/infra/client/DynamoClient";
import { AppConfig } from "src/shared/config/AppConfig";

@Injectable()
export class AccountRepository {
    constructor(private readonly config: AppConfig) {}

    async create(account: Account): Promise<void> {
        const command = new PutCommand({
            TableName: this.config.database.dynamodb.mainTable,
            Item: {
                type: "Account",
                id: account.id,
                externalId: account.externalId,
                PK: `Account#${account.id}`,
            },
        });

        await DynamoClient.send(command);
    }
}
