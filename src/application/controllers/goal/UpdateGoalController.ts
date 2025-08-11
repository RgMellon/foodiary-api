import { UpdateGoalUseCase } from "@application/usecases/goal/UpdateGoalUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { Controller } from "src/contracts/Controller";
import { UpdateGoalBody, updateGoalSchema } from "./schema/updateProfileSchema";

@Injectable()
@Schema(updateGoalSchema)
export class UpdateGoalController extends Controller<
    "private",
    UpdateGoalController.Response
> {
    constructor(private readonly updateGoalUseCase: UpdateGoalUseCase) {
        super();
    }

    async handle({
        accountId,
        body,
    }: Controller.HttpRequest<"private", UpdateGoalBody>): Promise<
        Controller.HttpResponse<UpdateGoalController.Response>
    > {
        const { calories, carbohydrates, fat, proteins } = body;

        await this.updateGoalUseCase.execute({
            calories,
            carbohydrates,
            fat,
            proteins,
            accountId,
        });

        return {
            statusCode: 204,
        };
    }
}

namespace UpdateGoalController {
    export type Response = null;
}
