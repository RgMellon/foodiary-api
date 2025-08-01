import { Injectable } from "@kernel/decorators/Injectable";
import { env } from "./env";

@Injectable()
export class AppConfig {
    readonly auth: AppConfig.Auth;
    readonly database: AppConfig.Database;
    readonly storage: AppConfig.Storage;

    constructor() {
        this.auth = {
            cognito: {
                clientId: env.COGNITO_CLIENT_ID,
                clientScret: env.COGNITO_CLIENT_SECRET,
                pool: {
                    id: env.COGNITO_POOL_ID,
                },
            },
        };

        this.database = {
            dynamodb: {
                mainTable: env.MAIN_TABLE_NAME,
            },
        };

        this.storage = {
            mealsBucket: env.MEALS_BUCKET,
        };
    }
}

export namespace AppConfig {
    export type Auth = {
        cognito: {
            clientId: string;
            clientScret: string;
            pool: {
                id: string;
            };
        };
    };

    export type Database = {
        dynamodb: {
            mainTable: string;
        };
    };

    export type Storage = {
        mealsBucket: string;
    };
}
