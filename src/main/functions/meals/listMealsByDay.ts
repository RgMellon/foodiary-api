import "reflect-metadata";

import { ListMealsByDayController } from "@application/controllers/meals/ListMealsByDayController";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(ListMealsByDayController);
