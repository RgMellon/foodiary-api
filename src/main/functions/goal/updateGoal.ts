import "reflect-metadata";

import { UpdateGoalController } from "@application/controllers/goal/UpdateGoalController";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(UpdateGoalController);
