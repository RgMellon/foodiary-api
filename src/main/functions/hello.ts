import { HelloController } from "../../application/controllers/HelloController";
import { lambdaHttpAdapter } from "../adapter/lambdaHttpAdapter";

const controller = new HelloController();

export const handler = lambdaHttpAdapter(controller);
