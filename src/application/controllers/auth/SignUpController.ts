import {
    SignUpBody,
    signupSchema,
} from "@application/controllers/auth/schemas/signupSchema";
import { SignUpUseCase } from "@application/usecases/auth/SignUpUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { Controller } from "src/contracts/Controller";

@Injectable()
@Schema(signupSchema)
export class SignUpController extends Controller<SignUpController.Response> {
    constructor(private readonly signUpUseCase: SignUpUseCase) {
        super();
    }

    async handle(
        request: Controller.HttpRequest<SignUpBody>
    ): Promise<Controller.HttpResponse<SignUpController.Response>> {
        const { account } = request.body;
        const { accessToken, refreshToken } = await this.signUpUseCase.execute(
            account
        );

        return {
            statusCode: 200,
            body: {
                accessToken,
                refreshToken,
            },
        };
    }
}

namespace SignUpController {
    export type Response = {
        accessToken: string;
        refreshToken: string;
    };
}
