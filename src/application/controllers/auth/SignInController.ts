import { SignInUseCase } from "@application/usecases/auth/SignInUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { Controller } from "src/contracts/Controller";
import { SignInBody, signInSchema } from "./schemas/signInSchema";

@Injectable()
@Schema(signInSchema)
export class SignInController extends Controller<
    "public",
    SignInController.Response
> {
    constructor(private readonly signInUseCase: SignInUseCase) {
        super();
    }

    async handle(
        request: Controller.HttpRequest<"public", SignInBody>
    ): Promise<Controller.HttpResponse<SignInController.Response>> {
        const { email, password } = request.body;
        const { accessToken, refreshToken } = await this.signInUseCase.execute({
            email,
            password,
        });

        return {
            statusCode: 200,
            body: {
                accessToken,
                refreshToken,
            },
        };
    }
}

namespace SignInController {
    export type Response = {
        accessToken: string;
        refreshToken: string;
    };
}
