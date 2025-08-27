import { Meal } from "@application/entities/Meal";
import { ResourceNotFound } from "@application/errors/application/ResourceNotFound";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
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
        const filename = `${KSUID.randomSync().string}.${extension}`;

        return `${accountId}/${filename}`;
    }

    async createPOST({
        file,
        mealId,
        accountId,
    }: MealsFileStorageGateway.CreatePresignedPostParams): Promise<MealsFileStorageGateway.CreatePostResult> {
        const bucket = this.appConfig.storage.mealsBucket;
        const contentType =
            file.inputType === Meal.InputType.AUDIO
                ? "audio/m4a"
                : "image/jpeg";

        const FIVE_MINUTES = 5 * 60;

        const { fields, url } = await createPresignedPost(s3Client, {
            Bucket: bucket,
            Key: file.key,
            Expires: FIVE_MINUTES,
            Conditions: [
                { bucket },
                ["eq", "$key", file.key],
                ["eq", "$Content-Type", contentType],
                ["content-length-range", file.size, file.size],
            ],
            Fields: {
                "x-amz-meta-mealid": mealId,
                "x-amz-meta-accountid": accountId,
            },
        });

        const uploadSignature = Buffer.from(
            JSON.stringify({
                url,
                fields: {
                    ...fields,
                    "Content-Type": contentType,
                },
            })
        ).toString("base64");

        return {
            uploadSignature,
        };
    }

    getFileUrl(fileKey: string) {
        return `https://${this.appConfig.cdn.mealsCdn}/${fileKey}`;
    }

    async getMetaData({
        fileKey,
    }: MealsFileStorageGateway.GetMetaDataParams): Promise<MealsFileStorageGateway.GetMetaDataParamsResult> {
        const command = new HeadObjectCommand({
            Bucket: this.appConfig.storage.mealsBucket,
            Key: fileKey,
        });

        const { Metadata = {} } = await s3Client.send(command);
        console.log({ Metadata, id: this.appConfig.storage.mealsBucket });

        if (!Metadata.accountid || !Metadata.mealid) {
            throw new ResourceNotFound(`Fail to get meta data from ${fileKey}`);
        }

        return {
            accountId: Metadata.accountid,
            mealId: Metadata.mealid,
        };
    }
}

export namespace MealsFileStorageGateway {
    export type GenerateFileKeyParams = {
        inputFile: Meal.InputType;
        accountId: string;
    };

    export type CreatePresignedPostParams = {
        file: {
            inputType: Meal.InputType;
            key: string;
            size: number;
        };
        mealId: string;
        accountId: string;
    };

    export type CreatePostResult = {
        uploadSignature: string;
    };

    export type GetMetaDataParams = {
        fileKey: string;
    };

    export type GetMetaDataParamsResult = {
        accountId: string;
        mealId: string;
    };
}
