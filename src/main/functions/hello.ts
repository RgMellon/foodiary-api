import "reflect-metadata";

import { HelloUseCase } from "@application/usecases/HelloUseCase";
import { Registry } from "@kernel/di/Registry";
import { HelloController } from "../../application/controllers/HelloController";
import { lambdaHttpAdapter } from "../adapter/lambdaHttpAdapter";

const container = new Registry();
container.register(HelloUseCase);
container.register(HelloController);

const controller = container.resolve(HelloController);

export const handler = lambdaHttpAdapter(controller);
