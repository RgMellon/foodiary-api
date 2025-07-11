import {
    InitiateAuthCommand,
    SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Injectable } from "@kernel/decorators/Injectable";
import { createHmac } from "crypto";
import { AppConfig } from "src/shared/config/AppConfig";
import { cognitoClient } from "../client/CognitoClient";

@Injectable()
export class AuthGateway {
    constructor(private readonly appConfig: AppConfig) {}

    async signIn({
        email,
        password,
    }: AuthGateway.SignInParams): Promise<AuthGateway.SignInResult> {
        const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: this.appConfig.auth.cognito.clientId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
                SECRET_HASH: this.generateSecretHash(email),
            },
        });

        const { AuthenticationResult } = await cognitoClient.send(command);

        if (
            !AuthenticationResult?.AccessToken ||
            !AuthenticationResult.RefreshToken
        ) {
            throw new Error(`Can't loging this user ${email}`);
        }

        return {
            accessToken: AuthenticationResult.AccessToken,
            refreshToken: AuthenticationResult.RefreshToken,
        };
    }

    async signUp({
        email,
        password,
    }: AuthGateway.SignupParams): Promise<AuthGateway.SignUpResult> {
        const command = new SignUpCommand({
            ClientId: this.appConfig.auth.cognito.clientId,
            Username: email,
            Password: password,
            SecretHash: this.generateSecretHash(email),
        });

        const { UserSub: externalId } = await cognitoClient.send(command);

        if (!externalId) {
            throw new Error(`Error on signup `);
        }

        return {
            externalId,
        };
    }

    private generateSecretHash(email: string) {
        const { clientId, clientScret } = this.appConfig.auth.cognito;

        return createHmac("SHA256", clientScret)
            .update(`${email}${clientId}`)
            .digest("base64");
    }
}

namespace AuthGateway {
    export type SignupParams = {
        email: string;
        password: string;
    };

    export type SignUpResult = {
        externalId: string;
    };

    export type SignInParams = {
        email: string;
        password: string;
    };

    export type SignInResult = {
        accessToken: string;
        refreshToken: string;
    };
}
