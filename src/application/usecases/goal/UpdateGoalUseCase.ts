import { Injectable } from "@kernel/decorators/Injectable";
import { GoalRepository } from "src/infra/database/dynamo/repositories/GoalRepository";

@Injectable()
export class UpdateGoalUseCase {
    constructor(private readonly goalRepository: GoalRepository) {}

    async execute(
        input: UpdateGoalUseCase.Input
    ): Promise<UpdateGoalUseCase.Output> {
        const goal = await this.goalRepository.findByAccountId(input.accountId);

        goal.calories = input.calories;
        goal.proteins = input.proteins;
        goal.carbohydrates = input.carbohydrates;
        goal.fat = input.fat;

        return await this.goalRepository.save(goal);
    }
}

export namespace UpdateGoalUseCase {
    export type Input = {
        accountId: string;
        calories: number;
        proteins: number;
        carbohydrates: number;
        fat: number;
    };

    export type Output = void;
}
