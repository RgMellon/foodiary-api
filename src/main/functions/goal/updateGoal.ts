import "reflect-metadata";

import { UpdateGoalController } from "@application/controllers/goal/UpdateGoalController";
import { Registry } from "@kernel/di/Registry";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

const controller = Registry.getInstance().resolve(UpdateGoalController);

export const handler = lambdaHttpAdapter(controller);
