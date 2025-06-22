import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { lambdaBodyParser } from "../utils/lambdaBodyParser";
import { IController } from "../../contracts/IController";

export function lambdaHttpAdapter(controller: IController<unknown>) {
    return async (
        event: APIGatewayProxyEventV2
    ): Promise<APIGatewayProxyResultV2> => {
        const request = {
            body: lambdaBodyParser(event.body),
            params: event.pathParameters || {},
            queryParams: event.queryStringParameters || {},
        };

        const result = await controller.handle(request);

        return {
            statusCode: result.statusCode,
            body: result.body ? JSON.stringify(result.body) : undefined,
        };
    };
}
