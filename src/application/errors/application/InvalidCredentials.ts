import { ErrorCode } from "../ErrorCode";
import { ApplicationError } from "./ApplicationError";

export class InvalidCredentials extends ApplicationError {
    code: ErrorCode;

    constructor() {
        super();

        this.name = "InvalidCredentials";
        this.code = ErrorCode.INVALID_REFRESH_TOKEN;
        this.message = "Invalid credentials";
    }
}
