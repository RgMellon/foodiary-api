import { Profile } from "@application/entities/Profile";
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
import { ProfileItem } from "../items/ProfileItem";

@Injectable()
export class ProfileRepository {
    constructor(private readonly config: AppConfig) {}

    getPutCommandInput(profile: Profile): PutCommandInput {
        const profileItem = ProfileItem.fromEntity(profile);

        return {
            TableName: this.config.database.dynamodb.mainTable,
            Item: profileItem.toItem(),
        };
    }

    async create(profile: Profile): Promise<void> {
        const command = new PutCommand(this.getPutCommandInput(profile));

        await DynamoClient.send(command);
    }

    async findByAccountId(accountId: string): Promise<Profile> {
        const command = new GetCommand({
            TableName: this.config.database.dynamodb.mainTable,
            Key: {
                PK: ProfileItem.getPk(accountId),
                SK: ProfileItem.getSK(accountId),
            },
        });

        const { Item: profileItem } = await DynamoClient.send(command);
        if (!profileItem) {
            throw new ResourceNotFound("Profile not found");
        }

        return ProfileItem.toEntity(profileItem as ProfileItem.ItemType);
    }

    async save(profile: Profile) {
        const command = new UpdateCommand({
            TableName: this.config.database.dynamodb.mainTable,
            Key: {
                PK: ProfileItem.getPk(profile.accountId),
                SK: ProfileItem.getSK(profile.accountId),
            },
            ReturnValues: "NONE",
            UpdateExpression:
                "SET #name = :name, #birthDate = :birthDate, #weight = :weight, #gender = :gender, #height = :height",
            ExpressionAttributeNames: {
                "#name": "name",
                "#birthDate": "birthDate",
                "#weight": "weight",
                "#gender": "gender",
                "#height": "height",
            },
            ExpressionAttributeValues: {
                ":name": profile.name,
                ":birthDate": profile.birthDate,
                ":weight": profile.weight,
                ":gender": profile.gender,
                ":height": profile.height,
            },
        });

        await DynamoClient.send(command);
    }
}
