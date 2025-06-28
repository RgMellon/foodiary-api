import { HttpError } from "@application/errors/http/HttpError";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ZodError } from "zod";
import { Controller } from "../../contracts/Controller";
import { lambdaBodyParser } from "../utils/lambdaBodyParser";
import { lambdaErrorResponse } from "../utils/lambdaErrorResponse";

export function lambdaHttpAdapter(controller: Controller<unknown>) {
    return async (
        event: APIGatewayProxyEventV2
    ): Promise<APIGatewayProxyResultV2> => {
        try {
            const request = {
                body: lambdaBodyParser(event.body),
                params: event.pathParameters || {},
                queryParams: event.queryStringParameters || {},
            };

            const result = await controller.execute(request);

            return {
                statusCode: result.statusCode,
                body: result.body ? JSON.stringify(result.body) : undefined,
            };
        } catch (error) {
            if (error instanceof ZodError) {
                return lambdaErrorResponse({
                    statusCode: 400,
                    code: "VALIDATION",
                    message: error.issues,
                });
            }

            if (error instanceof HttpError) {
                return lambdaErrorResponse(error);
            }

            return lambdaErrorResponse({
                code: "INTERNAL",
                message: "Internal server error",
                statusCode: 500,
            });
        }
    };
}
