import { Account } from "@application/entities/Account";
import { EmailAlreadyUsed } from "@application/errors/application/EmailAlreadyUsed";
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

        if (emailAlreadyUsed) {
            throw new EmailAlreadyUsed();
        }

        const account = new Account({
            email,
        });

        const { externalId } = await this.authGateway.signUp({
            email: email,
            password: password,
            internalId: account.id,
        });

        account.externalId = externalId;

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
