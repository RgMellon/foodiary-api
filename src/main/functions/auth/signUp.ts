import "reflect-metadata";

import { SignUpController } from "@application/controllers/auth/SignUpController";
import { Registry } from "@kernel/di/Registry";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

const controller = Registry.getInstance().resolve(SignUpController);

export const handler = lambdaHttpAdapter(controller);
