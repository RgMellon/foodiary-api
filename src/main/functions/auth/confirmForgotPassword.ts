import "reflect-metadata";

import { ConfirmForgotPasswordController } from "@application/controllers/auth/ConfirmForgotPassword";
import { Registry } from "@kernel/di/Registry";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

const controller = Registry.getInstance().resolve(
    ConfirmForgotPasswordController
);

export const handler = lambdaHttpAdapter(controller);
