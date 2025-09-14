import "reflect-metadata";

import { MealsQueueConsumer } from "@application/queues/MealsQueueConsumer";
import { lambdaSqsAdapter } from "@main/adapter/lambdaSqsAdapter";

export const handler = lambdaSqsAdapter(MealsQueueConsumer);
