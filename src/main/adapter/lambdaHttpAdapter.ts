import { ApplicationError } from "@application/errors/application/ApplicationError";
import { HttpError } from "@application/errors/http/HttpError";
import { Registry } from "@kernel/di/Registry";
import { lambdaBodyParser } from "@main/utils/lambdaBodyParser";
import {
    APIGatewayProxyEventV2,
    APIGatewayProxyEventV2WithJWTAuthorizer,
    APIGatewayProxyResultV2,
} from "aws-lambda";
import { Constructor } from "src/shared/types/constructor";
import { ZodError } from "zod";
import { Controller } from "../../contracts/Controller";
import { lambdaErrorResponse } from "../utils/lambdaErrorResponse";

type Event = APIGatewayProxyEventV2 | APIGatewayProxyEventV2WithJWTAuthorizer;

export function lambdaHttpAdapter(
    controllerImp: Constructor<Controller<any, unknown>>
) {
    const controller = Registry.getInstance().resolve(controllerImp);

    return async (event: Event): Promise<APIGatewayProxyResultV2> => {
        try {
            const accountId =
                "authorizer" in event.requestContext
                    ? (event.requestContext.authorizer.jwt.claims
                          .internalId as string)
                    : null;

            const request = {
                body: lambdaBodyParser(event.body),
                params: event.pathParameters || {},
                queryParams: event.queryStringParameters || {},
                accountId,
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

            if (error instanceof ApplicationError) {
                return lambdaErrorResponse({
                    ...error,
                    statusCode: 400,
                });
            }

            console.log(error);
            return lambdaErrorResponse({
                code: "INTERNAL",
                message: "Internal server error",
                statusCode: 500,
            });
        }
    };
}
