import { getSchema } from "../kernel/decorators/Schema";

export abstract class Controller<TBody = undefined> {
    abstract handle(
        params: Controller.HttpRequest
    ): Promise<Controller.HttpResponse<TBody>>;

    // Funciona como se fosse um proxy
    public execute(
        request: Controller.HttpRequest
    ): Promise<Controller.HttpResponse<TBody>> {
        const body = this.validateBody(request.body);

        return this.handle({
            ...request,
            body,
        });
    }

    private validateBody(body: Controller.HttpRequest["body"]) {
        const schema = getSchema(this);
        if (!schema) {
            return body;
        }

        return schema.parse(body);
    }
}

export namespace Controller {
    export type HttpRequest<
        TBody = Record<string, unknown>,
        TParams = Record<string, unknown>,
        TQueryParams = Record<string, unknown>
    > = {
        body: TBody;
        params: TParams;
        queryParams: TQueryParams;
    };

    export type HttpResponse<TBody = undefined> = {
        statusCode: number;
        body: TBody;
    };
}
