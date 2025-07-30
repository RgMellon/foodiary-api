import { Meal } from "@application/entities/Meal";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { Injectable } from "@kernel/decorators/Injectable";
import KSUID from "ksuid";
import { AppConfig } from "src/shared/config/AppConfig";
import { s3Client } from "../client/S3Client";

@Injectable()
export class MealsFileStorageGateway {
    constructor(private readonly appConfig: AppConfig) {}

    static generateFileKey({
        accountId,
        inputFile,
    }: MealsFileStorageGateway.GenerateFileKeyParams) {
        const extension = inputFile === Meal.InputType.AUDIO ? "m4a" : "jpeg";
        const fileName = `${KSUID.randomSync().string}/${extension}`;

        return `${accountId}/${fileName}`;
    }

    async createPOST({
        fileKey,
        fileSize,
        inputType,
    }: MealsFileStorageGateway.CreatePresignedPostParams): Promise<MealsFileStorageGateway.CreatePostResult> {
        const bucket = this.appConfig.storage.mealsBucket;
        const contentType =
            inputType === Meal.InputType.AUDIO ? "audio/m4a" : "image/jpeg";

        const FIVE_MINUTES = 5 * 60;

        const { fields, url } = await createPresignedPost(s3Client, {
            Bucket: bucket,
            Key: fileKey,
            Expires: FIVE_MINUTES,
            Conditions: [
                { bucket },
                ["eq", "$Key", fileKey],
                ["eq", "$Content-Type", contentType],
                ["content-length-range", fileSize, fileSize],
            ],
        });

        const uploadSignature = Buffer.from(
            JSON.stringify({ url, fields })
        ).toString("base64");

        return {
            uploadSignature,
        };
        // s3Client.send({});
    }
}

export namespace MealsFileStorageGateway {
    export type GenerateFileKeyParams = {
        inputFile: Meal.InputType;
        accountId: string;
    };

    export type CreatePresignedPostParams = {
        inputType: Meal.InputType;
        fileKey: string;
        fileSize: number;
    };

    export type CreatePostResult = {
        uploadSignature: string;
    };
}
