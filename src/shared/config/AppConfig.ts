import { Injectable } from "@kernel/decorators/Injectable";
import { env } from "./env";

@Injectable()
export class AppConfig {
    readonly auth: AppConfig.Auth;

    constructor() {
        this.auth = {
            cognito: {
                clientId: env.COGNITO_CLIENT_ID,
                clientScret: env.COGNITO_CLIENT_SECRET,
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
}
