import "reflect-metadata";

import { SignUpController } from "@application/controllers/auth/SignUpController";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(SignUpController);
