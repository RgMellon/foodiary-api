import { Profile } from "@application/entities/Profile";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { Injectable } from "@kernel/decorators/Injectable";
import { DynamoClient } from "src/infra/client/DynamoClient";
import { AppConfig } from "src/shared/config/AppConfig";
import { ProfileItem } from "../items/ProfileItem";

@Injectable()
export class ProfileRepository {
    constructor(private readonly config: AppConfig) {}

    async create(profile: Profile): Promise<void> {
        const profileItem = ProfileItem.fromEntity(profile);

        const command = new PutCommand({
            TableName: this.config.database.dynamodb.mainTable,
            Item: profileItem.toItem(),
        });

        await DynamoClient.send(command);
    }
}
