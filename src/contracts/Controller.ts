import { getSchema } from "../kernel/decorators/Schema";

type TRouteType = "public" | "private";

export abstract class Controller<TType extends TRouteType, TBody = undefined> {
    abstract handle(
        params: Controller.HttpRequest<TType>
    ): Promise<Controller.HttpResponse<TBody>>;

    // Funciona como se fosse um proxy
    public execute(
        request: Controller.HttpRequest<TType>
    ): Promise<Controller.HttpResponse<TBody>> {
        const body = this.validateBody(request.body);

        return this.handle({
            ...request,
            body,
        });
    }

    private validateBody(body: Controller.HttpRequest<TRouteType>["body"]) {
        const schema = getSchema(this);
        if (!schema) {
            return body;
        }

        return schema.parse(body);
    }
}

export namespace Controller {
    type BaseType<
        TBody = Record<string, unknown>,
        TParams = Record<string, unknown>,
        TQueryParams = Record<string, unknown>
    > = {
        body: TBody;
        params: TParams;
        queryParams: TQueryParams;
    };

    type PublicRequest<
        TBody = Record<string, unknown>,
        TParams = Record<string, unknown>,
        TQueryParams = Record<string, unknown>
    > = BaseType<TBody, TParams, TQueryParams> & {
        accountId: null;
    };

    type PrivateRquest<
        TBody = Record<string, unknown>,
        TParams = Record<string, unknown>,
        TQueryParams = Record<string, unknown>
    > = BaseType<TBody, TParams, TQueryParams> & {
        accountId: string;
    };

    export type HttpRequest<
        TType extends TRouteType,
        TBody = Record<string, unknown>,
        TParams = Record<string, unknown>,
        TQueryParams = Record<string, unknown>
    > = TType extends "public"
        ? PublicRequest<TBody, TParams, TQueryParams>
        : PrivateRquest<TBody, TParams, TQueryParams>;

    export type HttpResponse<TBody = undefined> = {
        statusCode: number;
        body?: TBody;
    };
}
