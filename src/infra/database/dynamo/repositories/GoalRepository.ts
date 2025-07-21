import { Goal } from "@application/entities/Goal";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@kernel/decorators/Injectable";
import { DynamoClient } from "src/infra/client/DynamoClient";
import { AppConfig } from "src/shared/config/AppConfig";
import { GoalItem } from "../items/GoalItem";

@Injectable()
export class GoalRepository {
    constructor(private readonly config: AppConfig) {}

    async create(goal: Goal): Promise<void> {
        const goalItem = GoalItem.fromEntity(goal);

        const command = new PutCommand({
            TableName: this.config.database.dynamodb.mainTable,
            Item: goalItem.toItem(),
        });

        await DynamoClient.send(command);
    }
}
