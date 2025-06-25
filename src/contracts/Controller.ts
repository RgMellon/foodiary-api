import { z } from "zod";

export abstract class Controller<TBody = undefined> {
    protected schema?: z.ZodSchema;

    abstract handle(
        params: Controller.HttpRequest
    ): Promise<Controller.HttpResponse<TBody>>;

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
        if (!this.schema) {
            return body;
        }

        return this.schema.parse(body);
    }
}

export namespace Controller {
    export type HttpRequest<
        TBody = Record<string, unknown>,
        TParams = Record<string, unknown>,
        TQueryParams = Record<string, unknown>
    > = {
        body?: TBody;
        params: TParams;
        queryParams: TQueryParams;
    };

    export type HttpResponse<TBody = undefined> = {
        statusCode: number;
        body: TBody;
    };
}
