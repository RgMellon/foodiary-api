import { Injectable } from "@kernel/decorators/Injectable";
import { IQueueConsumer } from "src/contracts/IQueueConsumer";
import { MealsQueue } from "src/infra/gateways/MealsQueue";

@Injectable()
export class MealsQueueConsumer implements IQueueConsumer<MealsQueue.Message> {
    // o que eo gateway msm MealsQueue
    async process({ accountId, mealId }: MealsQueue.Message): Promise<void> {
        console.log(JSON.stringify({ accountId, mealId }, null, 2));
    }
}
