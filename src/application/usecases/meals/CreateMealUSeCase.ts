import { Meal } from "@application/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";
import { MealRepository } from "src/infra/database/dynamo/repositories/MealRepository";

@Injectable()
export class CreateMealUseCase {
    constructor(private readonly mealRepository: MealRepository) {}

    async execute({
        accountId,
        file,
    }: CreateMealUseCase.Input): Promise<CreateMealUseCase.Output> {
        const meal = new Meal({
            accountId,
            inputType: file.type,
            status: Meal.Status.UPLOADING,
            inputFileKey: "TESTE",
        });

        await this.mealRepository.create(meal);

        return {
            mealId: meal.id,
        };
    }
}

export namespace CreateMealUseCase {
    export type Input = {
        accountId: string;
        file: {
            size: number;
            type: Meal.InputType;
        };
    };

    export type Output = {
        mealId: string;
    };
}
