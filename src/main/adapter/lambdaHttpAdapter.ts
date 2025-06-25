import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { lambdaBodyParser } from "../utils/lambdaBodyParser";
import { Controller } from "../../contracts/Controller";
import { ZodError } from "zod";

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
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: {
                            code: "VALIDATION",
                            message: error.issues,
                        },
                    }),
                };
            }

            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: {
                        code: "INTERNAL",
                        message: "Internal server error",
                    },
                }),
            };
        }
    };
}
