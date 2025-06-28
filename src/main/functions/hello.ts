import "reflect-metadata";

import { Registry } from "@kernel/di/Registry";
import { HelloController } from "../../application/controllers/HelloController";
import { lambdaHttpAdapter } from "../adapter/lambdaHttpAdapter";

const controller = Registry.getInstance().resolve(HelloController);

export const handler = lambdaHttpAdapter(controller);
