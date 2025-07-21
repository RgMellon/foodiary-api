import { Account } from "@application/entities/Account";
import {
    PutCommand,
    PutCommandInput,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@kernel/decorators/Injectable";
import { DynamoClient } from "src/infra/client/DynamoClient";
import { AppConfig } from "src/shared/config/AppConfig";
import { AccountItem } from "../items/AccountItem";

@Injectable()
export class AccountRepository {
    constructor(private readonly config: AppConfig) {}

    async findByEmail(email: string): Promise<Account | null> {
        const comand = new QueryCommand({
            IndexName: "GSI1",
            TableName: this.config.database.dynamodb.mainTable,
            KeyConditionExpression: "#GSI1PK = :GSI1PK AND #GSI1SK = :GSI1SK",
            Limit: 1,
            ExpressionAttributeNames: {
                "#GSI1PK": "GSI1PK",
                "#GSI1SK": "GSI1SK",
            },

            ExpressionAttributeValues: {
                ":GSI1PK": AccountItem.getGSI1PK(email),
                ":GSI1SK": AccountItem.getGSI1SK(email),
            },
        });

        const { Items = [] } = await DynamoClient.send(comand);
        const account = Items[0] as AccountItem.ItemType | undefined;
        if (!account) {
            return null;
        }

        return AccountItem.toEntity(account);
    }

    getPutCommandInput(account: Account): PutCommandInput {
        const accountItem = AccountItem.fromEntity(account);

        return {
            TableName: this.config.database.dynamodb.mainTable,
            Item: accountItem.toItem(),
        };
    }

    async create(account: Account): Promise<void> {
        const command = new PutCommand(this.getPutCommandInput(account));

        await DynamoClient.send(command);
    }
}
