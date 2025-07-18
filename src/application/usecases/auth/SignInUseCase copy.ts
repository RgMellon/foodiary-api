import { Injectable } from "@kernel/decorators/Injectable";
import { AuthGateway } from "src/infra/gateways/AuthGateway";

@Injectable()
export class ForgotPasswordUseCase {
    constructor(private readonly authGateway: AuthGateway) {}

    async execute({
        email,
    }: SignInUseCase.Input): Promise<SignInUseCase.Output> {
        return await this.authGateway.forgotPassword({
            email,
        });
    }
}

export namespace SignInUseCase {
    export type Input = {
        email: string;
    };

    export type Output = void;
}
