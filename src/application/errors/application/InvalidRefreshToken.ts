import { ErrorCode } from "../ErrorCode";
import { ApplicationError } from "./ApplicationError";

export class InvalidRefreshToken extends ApplicationError {
    statusCode?: number | undefined;
    code: ErrorCode;

    constructor() {
        super();

        this.name = "InvalidRefreshToken";
        this.code = ErrorCode.INVALID_REFRESH_TOKEN;
        this.message = "Invalid token";
    }
}
