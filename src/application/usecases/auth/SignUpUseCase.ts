import { Account } from "@application/entities/Account";
import { Injectable } from "@kernel/decorators/Injectable";
import { AccountRepository } from "src/infra/database/dynamo/repositories/AccountRepository";
import { AuthGateway } from "src/infra/gateways/AuthGateway";

@Injectable()
export class SignUpUseCase {
    constructor(
        private readonly authGateway: AuthGateway,
        private readonly accountRespository: AccountRepository
    ) {}

    async execute({
        email,
        password,
    }: SignUpUseCase.Input): Promise<SignUpUseCase.Output> {
        const emailAlreadyUsed = await this.accountRespository.findByEmail(
            email
        );

        console.log({ emailAlreadyUsed });

        if (emailAlreadyUsed) {
            throw new Error("Email already used");
        }

        const { externalId } = await this.authGateway.signUp({
            email: email,
            password: password,
        });

        const account = new Account({
            email,
            externalId,
        });

        await this.accountRespository.create(account);

        const { accessToken, refreshToken } = await this.authGateway.signIn({
            email,
            password,
        });

        return {
            accessToken,
            refreshToken,
        };
    }
}

export namespace SignUpUseCase {
    export type Input = {
        email: string;
        password: string;
    };

    export type Output = {
        accessToken: string;
        refreshToken: string;
    };
}
