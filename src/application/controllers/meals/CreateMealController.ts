import { Meal } from "@application/entities/Meal";
import { CreateMealUseCase } from "@application/usecases/meals/CreateMealUSeCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Schema } from "@kernel/decorators/Schema";
import { Controller } from "src/contracts/Controller";
import {
    createMealSchema,
    CreateMealSchema,
} from "../auth/schemas/createMealSchema";

@Injectable()
@Schema(createMealSchema)
export class CreateMealController extends Controller<
    "private",
    CreateMealController.Response
> {
    constructor(private readonly createMealUseCase: CreateMealUseCase) {
        super();
    }

    async handle({
        accountId,
        body,
    }: Controller.HttpRequest<"private", CreateMealSchema>): Promise<
        Controller.HttpResponse<CreateMealController.Response>
    > {
        const { file } = body;
        await this.createMealUseCase.execute({
            accountId,
            file: {
                size: file.size,
                type:
                    file.type === "image/jpeg"
                        ? Meal.InputType.PICTURE
                        : Meal.InputType.AUDIO,
            },
        });
        return {
            statusCode: 200,
            body: {
                accountId: accountId,
            },
        };
    }
}

namespace CreateMealController {
    export type Response = {
        accountId: string;
    };
}
