import { Goal } from "@application/entities/Goal";
import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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

    async findByAccountId(accountId: string): Promise<Goal> {
        const command = new GetCommand({
            TableName: this.config.database.dynamodb.mainTable,
            Key: {
                PK: GoalItem.getPk(accountId),
                SK: GoalItem.getSK(accountId),
            },
        });

        const { Item: goalItem } = await DynamoClient.send(command);
        if (!goalItem) {
            throw new ResourceNotFound("Goal not found");
        }

        return GoalItem.toEntity(goalItem as GoalItem.ItemType);
    }

    async create(goal: Goal): Promise<void> {
        const command = new PutCommand(this.getPutCommandInput(goal));

        await DynamoClient.send(command);
    }

    async save(goal: Goal) {
        const command = new UpdateCommand({
            TableName: this.config.database.dynamodb.mainTable,
            Key: {
                PK: GoalItem.getPk(goal.accountId),
                SK: GoalItem.getSK(goal.accountId),
            },
            ReturnValues: "NONE",
            UpdateExpression:
                "SET #calories = :calories, #proteins = :proteins, #carbohydrates = :carbohydrates, #fat = :fat",
            ExpressionAttributeNames: {
                "#calories": "calories",
                "#proteins": "proteins",
                "#carbohydrates": "carbohydrates",
                "#fat": "fat",
            },
            ExpressionAttributeValues: {
                ":calories": goal.calories,
                ":proteins": goal.proteins,
                ":carbohydrates": goal.carbohydrates,
                ":fat": goal.fat,
            },
        });

        await DynamoClient.send(command);
    }
}
