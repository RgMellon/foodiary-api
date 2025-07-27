import { Profile } from "@application/entities/Profile";
import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@kernel/decorators/Injectable";
import { DynamoClient } from "src/infra/client/DynamoClient";
import { AccountItem } from "src/infra/database/dynamo/items/AccountItem";
import { GoalItem } from "src/infra/database/dynamo/items/GoalItem";
import { ProfileItem } from "src/infra/database/dynamo/items/ProfileItem";
import { AppConfig } from "src/shared/config/AppConfig";

@Injectable()
export class GetProfileAndGoalQuery {
    constructor(private readonly appConfig: AppConfig) {}

    async run({
        accountId,
    }: GetProfileAndGoalQuery.Input): Promise<GetProfileAndGoalQuery.Output> {
        const command = new QueryCommand({
            TableName: this.appConfig.database.dynamodb.mainTable,
            Limit: 2,
            ProjectionExpression:
                "#PK, #SK, #name, #birthDate, #gender, #height, #weight, #calories, #fat, #proteins, #carbohydrates, #type",
            KeyConditionExpression: "#PK = :PK AND begins_with(#SK, :SK)",
            ExpressionAttributeNames: {
                "#PK": "PK",
                "#SK": "SK",
                "#name": "name",
                "#birthDate": "birthDate",
                "#gender": "gender",
                "#height": "height",
                "#weight": "weight",
                "#calories": "calories",
                "#fat": "fat",
                "#proteins": "proteins",
                "#carbohydrates": "carbohydrates",
                "#type": "type",
            },
            ExpressionAttributeValues: {
                ":PK": AccountItem.getPk(accountId),
                ":SK": `${AccountItem.getPk(accountId)}#`,
            },
        });

        const { Items = [] } = await DynamoClient.send(command);

        const profile = Items.find(
            (item): item is GetProfileAndGoalQuery.ProfileItemType =>
                item.type === ProfileItem.type
        );

        const goal = Items.find(
            (item): item is GetProfileAndGoalQuery.GoalItemType =>
                item.type === GoalItem.type
        );

        if (!profile || !goal) {
            throw new ResourceNotFound("account not found");
        }

        return {
            profile,
            goal,
        };
    }
}

namespace GetProfileAndGoalQuery {
    export type Input = {
        accountId: string;
    };

    export type Output = {
        profile: {
            name: string;
            birthDate: Date;
            gender: Profile.Gender;
            height: number;
            weight: number;
        };
        goal: {
            fat: number;
            carbohydrates: number;
            proteins: number;
            calories: number;
        };
    };

    export type ProfileItemType = {
        name: string;
        birthDate: Date;
        gender: Profile.Gender;
        height: number;
        weight: number;
    };

    export type GoalItemType = {
        fat: number;
        carbohydrates: number;
        proteins: number;
        calories: number;
    };
}
