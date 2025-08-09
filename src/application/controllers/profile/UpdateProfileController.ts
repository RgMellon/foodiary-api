import { UpdateProfile } from "@application/usecases/profile/UpdateProfile";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { Controller } from "src/contracts/Controller";
import {
    UpdateProfileBody,
    updateProfileSchema,
} from "./schema/updateProfileSchema";

@Injectable()
@Schema(updateProfileSchema)
export class UpdateProfileController extends Controller<
    "private",
    UpdateProfileController.Response
> {
    constructor(private readonly updateProfileUseCase: UpdateProfile) {
        super();
    }

    async handle({
        accountId,
        body,
    }: Controller.HttpRequest<"private", UpdateProfileBody>): Promise<
        Controller.HttpResponse<UpdateProfileController.Response>
    > {
        const { birthDate, gender, height, name, weight } = body;

        await this.updateProfileUseCase.execute({
            birthDate,
            gender,
            height,
            name,
            weight,
            accountId,
        });

        return {
            statusCode: 204,
        };
    }
}

namespace UpdateProfileController {
    export type Response = null;
}
