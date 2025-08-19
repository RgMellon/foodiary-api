import { Meal } from "@application/entities/Meal";
import { Injectable } from "@kernel/decorators/Injectable";
import { MealRepository } from "src/infra/database/dynamo/repositories/MealRepository";
import { MealsFileStorageGateway } from "src/infra/gateways/MealsFileStorageGateway";

@Injectable()
export class MealUploadedUseCase {
    constructor(
        private readonly mealRespository: MealRepository,
        readonly mealsFileStorageGateway: MealsFileStorageGateway
    ) {}

    async execute({
        fileKey,
    }: MealUploadedUseCase.Input): Promise<MealUploadedUseCase.Output> {
        const { accountId, mealId } =
            await this.mealsFileStorageGateway.getMetaData({ fileKey });

        const meal = await this.mealRespository.findById({
            accountId,
            mealId,
        });

        console.log(JSON.stringify(meal, null, 2));

        meal.status = Meal.Status.QUEUED;

        await this.mealRespository.save(meal);
    }
}

export namespace MealUploadedUseCase {
    export type Input = {
        fileKey: string;
    };

    export type Output = void;
}
