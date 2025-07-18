import { InvalidRefreshToken } from "@application/errors/application/InvalidRefreshToken";
import {
    ForgotPasswordCommand,
    GetTokensFromRefreshTokenCommand,
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
        internalId,
    }: AuthGateway.SignupParams): Promise<AuthGateway.SignUpResult> {
        const command = new SignUpCommand({
            ClientId: this.appConfig.auth.cognito.clientId,
            Username: email,
            Password: password,
            UserAttributes: [
                {
                    Name: "custom:internalId",
                    Value: internalId,
                },
            ],
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

    async refreshToken({
        refreshToken,
    }: AuthGateway.RefreshTokenParams): Promise<AuthGateway.RefreshTokenResult> {
        try {
            const command = new GetTokensFromRefreshTokenCommand({
                ClientId: this.appConfig.auth.cognito.clientId,
                RefreshToken: refreshToken,
                ClientSecret: this.appConfig.auth.cognito.clientScret,
            });

            const { AuthenticationResult } = await cognitoClient.send(command);

            if (
                !AuthenticationResult?.AccessToken ||
                !AuthenticationResult.RefreshToken
            ) {
                throw new Error(`Can't refresh token`);
            }

            return {
                accessToken: AuthenticationResult.AccessToken,
                refreshToken: AuthenticationResult.RefreshToken,
            };
        } catch {
            throw new InvalidRefreshToken();
        }
    }

    async forgotPassword({
        email,
    }: AuthGateway.ForgotPasswordParams): Promise<void> {
        const command = new ForgotPasswordCommand({
            ClientId: this.appConfig.auth.cognito.clientId,
            SecretHash: this.generateSecretHash(email),
            Username: email,
        });

        await cognitoClient.send(command);
    }
}

namespace AuthGateway {
    export type SignupParams = {
        email: string;
        password: string;
        internalId: string;
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

    export type RefreshTokenResult = {
        accessToken: string;
        refreshToken: string;
    };

    export type RefreshTokenParams = {
        refreshToken: string;
    };

    export type ForgotPasswordParams = {
        email: string;
    };
}
