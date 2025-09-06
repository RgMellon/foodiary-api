import { Meal } from "@application/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";
import { MealRepository } from "src/infra/database/dynamo/repositories/MealRepository";

const MAX_ATTEMPTS = 2;

@Injectable()
export class ProcessMealUseCase {
    constructor(private readonly mealRespository: MealRepository) {}

    async execute({ accountId, mealId }: ProcessMealUseCase.Input) {
        const meal = await this.mealRespository.findById({ accountId, mealId });

        if (meal.status === Meal.Status.UPLOADING) {
            throw new Error(`Error on upload meal ${mealId}`);
        }

        if (meal.status === Meal.Status.SUCCESS) {
            return;
        }

        if (meal.status === Meal.Status.PROCESSING) {
            throw new Error(`Meal ${mealId} is already being processed`);
        }

        try {
            meal.status = Meal.Status.PROCESSING;
            meal.attempts += 1;
            await this.mealRespository.save(meal);

            // Processa com a IA

            meal.name = "Cafe da manhã";
            meal.icon = "🥞";
            meal.foods = [
                {
                    calories: 330,
                    carbohydrates: 189,
                    fat: 50,
                    name: "Pao com frango",
                    proteins: 100,
                    quantity: "1",
                },
            ];
            meal.status = Meal.Status.SUCCESS;
            await this.mealRespository.save(meal);
            console.log(`Meal ${mealId} processed successfully`);
        } catch (err) {
            const currentStatus =
                meal.attempts >= MAX_ATTEMPTS
                    ? Meal.Status.FAILED
                    : Meal.Status.QUEUED;

            meal.status = currentStatus;
            await this.mealRespository.save(meal);
            throw err;
        }
    }
}

export namespace ProcessMealUseCase {
    export type Input = {
        accountId: string;
        mealId: string;
    };

    export type Output = void;
}
