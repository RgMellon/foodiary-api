import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Injectable } from "@kernel/decorators/Injectable";
import { cognitoClient } from "../client/CognitoClient";

@Injectable()
export class AuthGateway {
    async signUp({
        email,
        password,
    }: AuthGateway.SignupParams): Promise<AuthGateway.SignUpResult> {
        const command = new SignUpCommand({
            ClientId: "",
            Username: email,
            Password: password,
        });

        const { UserSub: externalId } = await cognitoClient.send(command);

        if (!externalId) {
            throw new Error(`Error on signup `);
        }

        return {
            externalId,
        };
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
}
