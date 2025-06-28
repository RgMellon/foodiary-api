import "reflect-metadata";

import { HelloUseCase } from "@application/usecases/HelloUseCase";
import { HelloController } from "../../application/controllers/HelloController";
import { lambdaHttpAdapter } from "../adapter/lambdaHttpAdapter";

const controller = new HelloController(new HelloUseCase());

export const handler = lambdaHttpAdapter(controller);
