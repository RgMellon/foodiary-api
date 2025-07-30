import { Meal } from "@application/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";
import { MealRepository } from "src/infra/database/dynamo/repositories/MealRepository";
import { MealsFileStorageGateway } from "src/infra/gateways/MealsFileStorageGateway";

@Injectable()
export class CreateMealUseCase {
    constructor(
        private readonly mealRepository: MealRepository,
        private readonly mealsFileStorageGateway: MealsFileStorageGateway
    ) {}

    async execute({
        accountId,
        file,
    }: CreateMealUseCase.Input): Promise<CreateMealUseCase.Output> {
        const fileKey = MealsFileStorageGateway.generateFileKey({
            accountId,
            inputFile: file.type,
        });

        const meal = new Meal({
            accountId,
            inputType: file.type,
            status: Meal.Status.UPLOADING,
            inputFileKey: fileKey,
        });

        await Promise.all([
            this.mealRepository.create(meal),
            this.mealsFileStorageGateway.createPOST({
                fileKey,
                fileSize: file.size,
                inputType: file.type,
            }),
        ]);

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
