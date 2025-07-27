import { Meal } from "@application/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class CreateMealUseCase {
    execute({
        accountId,
        file,
    }: CreateMealUseCase.Input): CreateMealUseCase.Output {
        const meal = new Meal({
            accountId,
            inputType: file.type,
            status: Meal.Status.UPLOADING,
            inputFileKey: "TESTE",
        });

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
