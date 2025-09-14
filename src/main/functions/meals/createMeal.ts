import "reflect-metadata";

import { CreateMealController } from "@application/controllers/meals/CreateMealController";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(CreateMealController);
