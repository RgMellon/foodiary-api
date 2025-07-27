import { ErrorCode } from "../ErrorCode";
import { ApplicationError } from "./ApplicationError";

export class ResourceNotFound extends ApplicationError {
    code: ErrorCode;
    statusCode: number;

    constructor(message?: string) {
        super();
        this.statusCode = 404;
        this.name = "ResourceNotFound";
        this.code = ErrorCode.RESOURCE_NOT_FOUND;
        this.message = message ?? "The resource was not found";
    }
}
