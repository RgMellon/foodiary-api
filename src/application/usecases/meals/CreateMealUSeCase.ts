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

        const [, { uploadSignature }] = await Promise.all([
            this.mealRepository.create(meal),
            this.mealsFileStorageGateway.createPOST({
                file: {
                    key: fileKey,
                    size: file.size,
                    inputType: file.type,
                },
                mealId: meal.id,
            }),
        ]);

        return {
            uploadSignature,
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
        uploadSignature: string;
        mealId: string;
    };
}
