import "reflect-metadata";

import { ForgotPasswordController } from "@application/controllers/auth/ForgotPasswordController";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(ForgotPasswordController);
