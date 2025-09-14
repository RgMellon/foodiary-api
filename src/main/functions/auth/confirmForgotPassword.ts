import "reflect-metadata";

import { ConfirmForgotPasswordController } from "@application/controllers/auth/ConfirmForgotPassword";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(ConfirmForgotPasswordController);
