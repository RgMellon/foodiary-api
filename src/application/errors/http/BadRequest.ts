import { ErrorCode } from "../ErrorCode";
import { HttpError } from "./HttpError";

export class BadRequest extends HttpError {
    statusCode = 400;
    code: ErrorCode;

    constructor(message: any, code?: ErrorCode) {
        super();

        this.name = "BadRequest";
        this.code = code ?? ErrorCode.BAD_REQUEST;
        this.message = message ?? ErrorCode.BAD_REQUEST;
    }
}
