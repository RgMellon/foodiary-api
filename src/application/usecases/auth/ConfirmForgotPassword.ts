import { Injectable } from "@kernel/decorators/Injectable";
import { AuthGateway } from "src/infra/gateways/AuthGateway";

@Injectable()
export class ConfirmForgotPasswordUseCase {
    constructor(private readonly authGateway: AuthGateway) {}

    async execute({
        email,
        code,
        password,
    }: ConfirmForgotPasswordUseCase.Input): Promise<ConfirmForgotPasswordUseCase.Output> {
        return await this.authGateway.confirmForgotPassword({
            email,
            code,
            password,
        });
    }
}

export namespace ConfirmForgotPasswordUseCase {
    export type Input = {
        email: string;
        password: string;
        code: string;
    };

    export type Output = void;
}
