import { Controller } from "../../contracts/Controller";
import { Schema } from "../../kernel/decorators/Schema";
import { HelloBody, helloSchema } from "../schemas/helloSchema";

@Schema(helloSchema)
export class HelloController extends Controller<unknown> {
    async handle(
        request: Controller.HttpRequest<HelloBody>
    ): Promise<Controller.HttpResponse<unknown>> {
         return {
            statusCode: 200,
            body: request.body,
        };
    }
}
