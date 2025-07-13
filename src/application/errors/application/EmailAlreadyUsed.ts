import { ErrorCode } from "../ErrorCode";
import { ApplicationError } from "./ApplicationError";

export class EmailAlreadyUsed extends ApplicationError {
    code: ErrorCode;

    constructor(message?: any, code?: ErrorCode) {
        super();

        this.name = "EmailAlreadyUsed";
        this.code = code ?? ErrorCode.EMAIL_ALREADY_USED;
        this.message = message ?? "This email already in use";
    }
}
