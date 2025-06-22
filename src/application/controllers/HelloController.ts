import { IController } from "../../contracts/IController";

export class HelloController implements IController<unknown> {
    async handle(
        request: IController.HttpRequest
    ): Promise<IController.HttpResponse<unknown>> {
        return {
            statusCode: 200,
            body: {
                request,
            },
        };
    }
}
