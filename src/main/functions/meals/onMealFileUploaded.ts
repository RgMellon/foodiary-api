import "reflect-metadata";

import { MealUploadedFileEventHandler } from "@application/events/file/MealUploadedFileEventHandler";
import { lambdaS3Adapter } from "@main/adapter/lambdaS3Adapter";

export const handler = lambdaS3Adapter(MealUploadedFileEventHandler);
