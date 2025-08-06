import { Meal } from "@application/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";
import { MealRepository } from "src/infra/database/dynamo/repositories/MealRepository";

@Injectable()
export class GetMealByIdUseCase {
    constructor(private readonly mealRespository: MealRepository) {}

    async execute({
        accountId,
        mealId,
    }: GetMealByIdUseCase.Input): Promise<GetMealByIdUseCase.Output> {
        const mealItem = await this.mealRespository.findById({
            accountId,
            mealId,
        });

        return {
            meal: {
                createdAt: mealItem.createdAt,
                foods: mealItem.foods,
                icon: mealItem.icon,
                id: mealItem.id,
                name: mealItem.name,
                status: mealItem.status,
                inputType: mealItem.inputType,
                inputFileKey: mealItem.inputFileKey,
            },
        };
    }
}

export namespace GetMealByIdUseCase {
    export type Input = {
        accountId: string;
        mealId: string;
    };

    export type Output = {
        meal: {
            id: string;
            status: Meal.Status;
            inputType: Meal.InputType;
            inputFileKey: string;
            name: string;
            createdAt: Date;
            foods: Meal.Food[];
            icon: string;
        };
    };
}
