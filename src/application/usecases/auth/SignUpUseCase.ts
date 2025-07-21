import { Account } from "@application/entities/Account";
import { Goal } from "@application/entities/Goal";
import { Profile } from "@application/entities/Profile";
import { EmailAlreadyUsed } from "@application/errors/application/EmailAlreadyUsed";
import { Injectable } from "@kernel/decorators/Injectable";
import { AccountRepository } from "src/infra/database/dynamo/repositories/AccountRepository";
import { SignUpUnityOfWork } from "src/infra/database/dynamo/uow/SignUpUnityOfWork";
import { AuthGateway } from "src/infra/gateways/AuthGateway";

@Injectable()
export class SignUpUseCase {
    constructor(
        private readonly authGateway: AuthGateway,
        private readonly accountRespository: AccountRepository,
        private readonly singupUow: SignUpUnityOfWork
    ) {}

    async execute({
        account: { email, password },
        profile: profileData,
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

        const profile = new Profile({
            ...profileData,
            accountId: account.id,
        });

        const goal = new Goal({
            accountId: account.id,
            calories: 2000,
            carbohydrates: 150,
            proteins: 300,
            fat: 50,
            createdAt: new Date(),
        });

        const { externalId } = await this.authGateway.signUp({
            email: email,
            password: password,
            internalId: account.id,
        });

        account.externalId = externalId;

        await this.singupUow.run({
            account,
            goal,
            profile,
        });

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
        profile: {
            name: string;
            birthDate: Date;
            gender: Profile.Gender;
            height: number;
            weight: number;
            activityLevel: Profile.ActivityLevel;
            goal: Profile.Goal;
        };
        account: {
            email: string;
            password: string;
        };
    };

    export type Output = {
        accessToken: string;
        refreshToken: string;
    };
}
