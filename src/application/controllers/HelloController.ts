import { IHttpRequest } from "../../contracts/IHttpRequest";
import { IHttpResponse } from "../../contracts/IHttpResponse";

export class HelloController {
    async handle(request: IHttpRequest): Promise<IHttpResponse<unknown>> {
        return {
            statusCode: 200,
            body: {
                request,
            },
        };
    }
}
