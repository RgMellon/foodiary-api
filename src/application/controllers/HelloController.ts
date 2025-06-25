import { Controller } from "../../contracts/Controller";
import { HelloBody, helloSchema } from "../schemas/helloSchema";

export class HelloController extends Controller<unknown> {
    async handle(
        request: Controller.HttpRequest<HelloBody>
    ): Promise<Controller.HttpResponse<unknown>> {
        this.schema = helloSchema;

        return {
            statusCode: 200,
            body: request.body,
        };
    }
}
