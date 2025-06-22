import { APIGatewayProxyEventV2 } from "aws-lambda";
import { HelloController } from "./application/controllers/HelloController";
import { lambdaBodyParser } from "./main/utils/lambdaBodyParser";

const controller = new HelloController();

export async function handler(event: APIGatewayProxyEventV2) {
    const request = {
        body: lambdaBodyParser(event.body),
        params: event.pathParameters || {},
        queryParams: event.queryStringParameters || {},
    };

    return await controller.handle(request);
}
