import "reflect-metadata";

import { UpdateProfileController } from "@application/controllers/profile/UpdateProfileController";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(UpdateProfileController);
