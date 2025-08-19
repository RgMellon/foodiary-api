import { Meal } from "@application/entities/Meal";
import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import {
    GetCommand,
    PutCommand,
    PutCommandInput,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@kernel/decorators/Injectable";
import { DynamoClient } from "src/infra/client/DynamoClient";
import { AppConfig } from "src/shared/config/AppConfig";
import { MealItem } from "../items/MealItem";

@Injectable()
export class MealRepository {
    constructor(private readonly config: AppConfig) {}

    getPutCommandInput(meal: Meal): PutCommandInput {
        const mealItem = MealItem.fromEntity(meal);

        return {
            TableName: this.config.database.dynamodb.mainTable,
            Item: mealItem.toItem(),
        };
    }

    async create(meal: Meal): Promise<void> {
        const command = new PutCommand(this.getPutCommandInput(meal));

        await DynamoClient.send(command);
    }

    async findById({ accountId, mealId }: MealRepository.FindByIdParams) {
        const command = new GetCommand({
            TableName: this.config.database.dynamodb.mainTable,
            Key: {
                PK: MealItem.getPk({
                    accountId,
                    mealId,
                }),
                SK: MealItem.getSK({
                    accountId,
                    mealId,
                }),
            },
        });

        const { Item: mealItem } = await DynamoClient.send(command);

        if (!mealItem) {
            throw new ResourceNotFound("Meal not found");
        }

        return MealItem.toEntity(mealItem as MealItem.ItemType);
    }

    async save(meal: Meal) {
        const command = new UpdateCommand({
            TableName: this.config.database.dynamodb.mainTable,
            Key: {
                PK: MealItem.getPk({
                    mealId: meal.id,
                    accountId: meal.accountId,
                }),
                SK: MealItem.getSK({
                    mealId: meal.id,
                    accountId: meal.accountId,
                }),
            },
            ReturnValues: "NONE",
            UpdateExpression:
                "SET #status = :status, #attempts = :attempts, #icon = :icon, #name = :name, #foods = :foods",
            ExpressionAttributeNames: {
                "#status": "status",
                "#attempts": "attempts",
                "#icon": "icon",
                "#name": "name",
                "#foods": "foods",
            },
            ExpressionAttributeValues: {
                ":status": meal.status,
                ":attempts": meal.attempts,
                ":icon": meal.icon,
                ":name": meal.name,
                ":foods": meal.foods,
            },
        });

        await DynamoClient.send(command);
    }
}

export namespace MealRepository {
    export type FindByIdParams = {
        accountId: string;
        mealId: string;
    };
}
