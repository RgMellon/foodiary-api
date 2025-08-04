import { Meal } from "@application/entities/Meal";
import { ListMealByDayUseCase } from "@application/usecases/meals/ListMealsByDayUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Controller } from "src/contracts/Controller";
import { listMealByDaySchema } from "../auth/schemas/listMealsByDaySchema";

@Injectable()
export class ListMealsByDayController extends Controller<
    "private",
    ListMealsByDayController.Response
> {
    constructor(private readonly listMealByDayUseCase: ListMealByDayUseCase) {
        super();
    }

    async handle({
        accountId,
        queryParams,
    }: Controller.HttpRequest<"private">): Promise<
        Controller.HttpResponse<ListMealsByDayController.Response>
    > {
        const { day } = listMealByDaySchema.parse(queryParams);

        const { meals } = await this.listMealByDayUseCase.execute({
            accountId,
            day,
        });
        return {
            statusCode: 200,
            body: {
                meals,
            },
        };
    }
}

namespace ListMealsByDayController {
    export type Response = {
        meals: {
            id: string;
            createdAt: string;
            foods: Meal.Food[];
            icon: string;
            name: string;
        }[];
    };
}
