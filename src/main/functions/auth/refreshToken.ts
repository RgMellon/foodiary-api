import "reflect-metadata";

import { RefreshTokenController } from "@application/controllers/auth/RefreshTokenController";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(RefreshTokenController);
