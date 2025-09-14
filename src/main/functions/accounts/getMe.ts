import "reflect-metadata";

import { GetMeController } from "@application/controllers/accounts/GetMeController";
import { lambdaHttpAdapter } from "@main/adapter/lambdaHttpAdapter";

export const handler = lambdaHttpAdapter(GetMeController);
