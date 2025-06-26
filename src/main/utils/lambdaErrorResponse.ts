interface ILambdaErrorResponseParams {
    code: string;
    message: any;
    statusCode: number;
}

export function lambdaErrorResponse({
    code,
    message,
    statusCode,
}: ILambdaErrorResponseParams) {
    return {
        statusCode,
        body: JSON.stringify({
            error: {
                code,
                message,
            },
        }),
    };
}
