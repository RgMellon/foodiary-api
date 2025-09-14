import "reflect-metadata";

import { SignInController } from "@application/controllers/auth/SignInController";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(SignInController);
