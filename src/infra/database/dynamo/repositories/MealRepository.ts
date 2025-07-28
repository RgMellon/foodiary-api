import { Meal } from "@application/entities/Meal";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
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
}
