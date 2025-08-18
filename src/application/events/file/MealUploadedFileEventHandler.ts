import { Injectable } from "@kernel/decorators/Injectable";
import {
    IFileEventHandle,
    IFileEventHandler,
} from "src/contracts/IFileEventHandler";

@Injectable()
export class MealUploadedFileEventHandler implements IFileEventHandler {
    async handle({ fileKey }: IFileEventHandle.Input): Promise<void> {
        console.log({
            MealUploadedFileEventHandler: fileKey,
        });
    }
}
