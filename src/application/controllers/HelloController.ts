import { HelloUseCase } from "@application/usecases/HelloUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import { Controller } from "../../contracts/Controller";
import { Schema } from "../../kernel/decorators/Schema";
import { HelloBody, helloSchema } from "../schemas/helloSchema";

@Injectable()
@Schema(helloSchema)
export class HelloController extends Controller<unknown> {
    constructor(private readonly useCase: HelloUseCase) {
        super();
    }

    async handle(
        request: Controller.HttpRequest<HelloBody>
    ): Promise<Controller.HttpResponse<unknown>> {
        const response = await this.useCase.execute({
            email: request.body.email,
        });

        return {
            statusCode: 200,
            body: response,
        };
    }
}
