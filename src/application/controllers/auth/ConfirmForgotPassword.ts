import { ConfirmForgotPasswordUseCase } from "@application/usecases/auth/ConfirmForgotPassword";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { Controller } from "src/contracts/Controller";
import {
    confirmForgotPassword,
    ConfirmForgotPasswordBody,
} from "./schemas/confirmForgotPasswordSchema";

@Injectable()
@Schema(confirmForgotPassword)
export class ConfirmForgotPasswordController extends Controller<
    "public",
    ConfirmForgotPasswordController.Response
> {
    constructor(
        private readonly confirmForgotPasswordUseCase: ConfirmForgotPasswordUseCase
    ) {
        super();
    }

    async handle({
        body,
    }: Controller.HttpRequest<"public", ConfirmForgotPasswordBody>): Promise<
        Controller.HttpResponse<ConfirmForgotPasswordController.Response>
    > {
        const { email, code, password } = body;

        await this.confirmForgotPasswordUseCase.execute({
            email,
            code,
            password,
        });

        return {
            statusCode: 200,
        };
    }
}

namespace ConfirmForgotPasswordController {
    export type Response = null;
}
