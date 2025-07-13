import { ErrorCode } from "../ErrorCode";

export abstract class ApplicationError extends Error {
    abstract code: ErrorCode;
}
