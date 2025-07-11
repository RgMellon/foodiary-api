import { Injectable } from "@kernel/decorators/Injectable";
import { env } from "./env";

@Injectable()
export class AppConfig {
    readonly auth: AppConfig.Auth;
    readonly database: AppConfig.Database;

    constructor() {
        this.auth = {
            cognito: {
                clientId: env.COGNITO_CLIENT_ID,
                clientScret: env.COGNITO_CLIENT_SECRET,
            },
        };

        this.database = {
            dynamodb: {
                mainTable: env.MAIN_TABLE_NAME,
            },
        };
    }
}

export namespace AppConfig {
    export type Auth = {
        cognito: {
            clientId: string;
            clientScret: string;
        };
    };

    export type Database = {
        dynamodb: {
            mainTable: string;
        };
    };
}
