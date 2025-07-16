import { RefreshTokenUseCase } from "@application/usecases/auth/RefreshTokenUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { Controller } from "src/contracts/Controller";
import {
    RefreshTokenBody,
    refreshTokenSchema,
} from "./schemas/refreshTokenSchema";

@Injectable()
@Schema(refreshTokenSchema)
export class RefreshTokenController extends Controller<
    "public",
    RefreshTokenController.Response
> {
    constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {
        super();
    }

    async handle(
        request: Controller.HttpRequest<"public", RefreshTokenBody>
    ): Promise<Controller.HttpResponse<RefreshTokenController.Response>> {
        const { refreshToken } = request.body;
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await this.refreshTokenUseCase.execute({
                refreshToken,
            });

        return {
            statusCode: 200,
            body: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        };
    }
}

namespace RefreshTokenController {
    export type Response = {
        accessToken: string;
        refreshToken: string;
    };
}
