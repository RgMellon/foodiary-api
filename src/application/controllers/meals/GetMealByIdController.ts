import { Meal } from "@application/entities/Meal";
import { GetMealByIdUseCase } from "@application/usecases/meals/GetMealByIdUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Controller } from "src/contracts/Controller";

@Injectable()
export class GetMealByIdController extends Controller<
    "private",
    GetMealByIdController.Response
> {
    constructor(private readonly getMealById: GetMealByIdUseCase) {
        super();
    }

    async handle({
        accountId,
        params,
    }: Controller.HttpRequest<
        "private",
        Record<string, unknown>,
        { id: string }
    >): Promise<Controller.HttpResponse<GetMealByIdController.Response>> {
        const { id: mealId } = params;

        console.log({ mealId });
        const response = await this.getMealById.execute({
            accountId,
            mealId,
        });

        return {
            statusCode: 200,
            body: {
                meal: response.meal,
            },
        };
    }
}

namespace GetMealByIdController {
    export type Input = {
        accountId: string;
        mealId: string;
    };

    export type Response = {
        meal: {
            id: string;
            status: Meal.Status;
            inputType: Meal.InputType;
            inputFileUrl: string;
            name: string;
            createdAt: Date;
            foods: Meal.Food[];
            icon: string;
        };
    };
}
