import "reflect-metadata";

import { UpdateProfileController } from "@application/controllers/profile/UpdateProfileController";
import { Registry } from "@kernel/di/Registry";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

const controller = Registry.getInstance().resolve(UpdateProfileController);

export const handler = lambdaHttpAdapter(controller);
