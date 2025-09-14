import { Meal } from "@application/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";
import { MealsAiGateway } from "src/infra/ai/meals/MealsAiGateway";
import { MealRepository } from "src/infra/database/dynamo/repositories/MealRepository";

const MAX_ATTEMPTS = 2;

@Injectable()
export class ProcessMealUseCase {
    constructor(
        private readonly mealRespository: MealRepository,
        private readonly mealsAiGateway: MealsAiGateway
    ) {}

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

            const { foods, icon, name } = await this.mealsAiGateway.processMeal(
                meal
            );

            meal.name = name;
            meal.icon = icon;
            meal.foods = foods;

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
