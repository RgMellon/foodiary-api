import { Profile } from "@application/entities/Profile";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
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
}
