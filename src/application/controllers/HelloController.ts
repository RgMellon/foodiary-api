import { HelloUseCase } from "@application/usecases/HelloUseCase";
import { Controller } from "../../contracts/Controller";
import { Schema } from "../../kernel/decorators/Schema";
import { HelloBody, helloSchema } from "../schemas/helloSchema";

@Schema(helloSchema)
export class HelloController extends Controller<unknown> {
    constructor(private readonly useCase: HelloUseCase) {
        super();
    }

    async handle(
        request: Controller.HttpRequest<HelloBody>
    ): Promise<Controller.HttpResponse<unknown>> {
        const response = this.useCase.execute({ email: request.body.email });

        return {
            statusCode: 200,
            body: response,
        };
    }
}
