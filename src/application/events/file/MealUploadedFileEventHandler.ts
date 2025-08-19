import { MealUploadedUseCase } from "@application/usecases/meals/MealUploadedUseCase";
import { Injectable } from "@kernel/decorators/Injectable";
import {
    IFileEventHandle,
    IFileEventHandler,
} from "src/contracts/IFileEventHandler";

@Injectable()
export class MealUploadedFileEventHandler implements IFileEventHandler {
    constructor(private readonly mealUploadedUseCase: MealUploadedUseCase) {}

    async handle({ fileKey }: IFileEventHandle.Input): Promise<void> {
        await this.mealUploadedUseCase.execute({ fileKey });
    }
}
