export interface IController<TBody = undefined> {
    handle(
        params: IController.HttpRequest
    ): Promise<IController.HttpResponse<TBody>>;
}

export namespace IController {
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
