import { Goal } from "@application/entities/Goal";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@kernel/decorators/Injectable";
import { DynamoClient } from "src/infra/client/DynamoClient";
import { AppConfig } from "src/shared/config/AppConfig";
import { GoalItem } from "../items/GoalItem";

@Injectable()
export class GoalRepository {
    constructor(private readonly config: AppConfig) {}

    getPutCommandInput(goal: Goal) {
        const goalItem = GoalItem.fromEntity(goal);

        return {
            TableName: this.config.database.dynamodb.mainTable,
            Item: goalItem.toItem(),
        };
    }

    async create(goal: Goal): Promise<void> {
        const command = new PutCommand(this.getPutCommandInput(goal));

        await DynamoClient.send(command);
    }
}
