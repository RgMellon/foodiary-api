import { ProcessMealUseCase } from "@application/usecases/meals/ProcessMealUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { IQueueConsumer } from "src/contracts/IQueueConsumer";
import { MealsQueue } from "src/infra/gateways/MealsQueue";

@Injectable()
export class MealsQueueConsumer implements IQueueConsumer<MealsQueue.Message> {
    constructor(private readonly processMealUseCase: ProcessMealUseCase) {}
    async process({ accountId, mealId }: MealsQueue.Message): Promise<void> {
        await this.processMealUseCase.execute({ accountId, mealId });
    }
}
