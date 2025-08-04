import { Meal } from "@application/entities/Meal";
import { ListMealByDayQuery } from "@application/query/ListMealsByDayQuery";
import { Injectable } from "@kernel/decorators/Injectable";

@Injectable()
export class ListMealByDayUseCase {
    constructor(private readonly listMealByDayQuery: ListMealByDayQuery) {}

    async execute({
        accountId,
        day,
    }: ListMealByDayUseCase.Input): Promise<ListMealByDayUseCase.Output> {
        const response = await this.listMealByDayQuery.run({
            accountId,
            date: day,
        });

        return {
            meals: response.meals,
        };
    }
}

export namespace ListMealByDayUseCase {
    export type Input = {
        accountId: string;
        day: Date;
    };

    export type Output = {
        meals: {
            id: string;
            createdAt: string;
            foods: Meal.Food[];
            icon: string;
            name: string;
        }[];
    };
}
