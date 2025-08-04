import { Meal } from "@application/entities/Meal";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@kernel/decorators/Injectable";
import { DynamoClient } from "src/infra/client/DynamoClient";
import { MealItem } from "src/infra/database/dynamo/items/MealItem";
import { AppConfig } from "src/shared/config/AppConfig";

@Injectable()
export class ListMealByDayQuery {
    constructor(private readonly appConfig: AppConfig) {}

    async run({
        accountId,
        date,
    }: ListMealByDayQuery.Input): Promise<ListMealByDayQuery.Output> {
        const command = new QueryCommand({
            TableName: this.appConfig.database.dynamodb.mainTable,
            IndexName: "GSI1",
            Limit: 1,
            ProjectionExpression:
                "#GSI1PK, #id, #createdAt, #name, #icon, #foods",
            KeyConditionExpression: "#GSI1PK = :GSI1PK",
            ExpressionAttributeNames: {
                "#GSI1PK": "GSI1PK",
                "#name": "name",
                "#id": "id",
                "#createdAt": "createdAt",
                "#icon": "icon",
                "#foods": "foods",
            },

            ExpressionAttributeValues: {
                ":GSI1PK": MealItem.getGSI1PK({
                    accountId,
                    date: date,
                }),
            },
        });

        const { Items = [] } = await DynamoClient.send(command);
        const items = Items as MealItem.ItemType[];

        const meals: ListMealByDayQuery.Output["meals"] = items.map((item) => ({
            id: item.id,
            createdAt: item.createdAt,
            foods: item.foods,
            name: item.name,
            icon: item.icon,
        }));

        return {
            meals,
        };
    }
}

export namespace ListMealByDayQuery {
    export type Input = {
        date: Date;
        accountId: string;
    };

    export type MealItemType = {
        GSI1PK: string;
        id: string;
        createdAt: string;
        name: string;
        icon: string;
        foods: Meal.Food[];
    };

    export type Output = {
        meals: {
            id: string;
            createdAt: string;
            foods: Meal.Food[];
            icon: string;
            name: string;
        }[];
    };
}
