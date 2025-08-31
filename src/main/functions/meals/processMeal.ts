import "reflect-metadata";

import { MealsQueueConsumer } from "@application/queues/MealsQueueConsumer";
import { Registry } from "@kernel/di/Registry";
import { lambdaSqsAdapter } from "@main/adapter/lambdaSqsAdapter";

 const consumer = Registry.getInstance().resolve(MealsQueueConsumer);

export const handler = lambdaSqsAdapter(consumer);
