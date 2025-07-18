import { ForgotPasswordUseCase } from "@application/usecases/auth/ForgotPasswordUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { Controller } from "src/contracts/Controller";
import {
    ForgotPasswordBody,
    forgotPasswordSchema,
} from "./schemas/forgotPasswordSchema";

@Injectable()
@Schema(forgotPasswordSchema)
export class ForgotPasswordController extends Controller<
    "public",
    ForgotPasswordController.Response
> {
    constructor(private readonly forgotPasswordUseCase: ForgotPasswordUseCase) {
        super();
    }

    async handle({
        body,
    }: Controller.HttpRequest<"public", ForgotPasswordBody>): Promise<
        Controller.HttpResponse<ForgotPasswordController.Response>
    > {
        const { email } = body;

        await this.forgotPasswordUseCase.execute({
            email,
        });

        return {
            statusCode: 204,
        };
    }
}

namespace ForgotPasswordController {
    export type Response = null;
}
