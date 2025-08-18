import { S3Handler } from "aws-lambda";
import { IFileEventHandler } from "src/contracts/IFileEventHandler";

export function lambdaS3Adapter(eventHandler: IFileEventHandler): S3Handler {
    return async (event) => {
        const responses = await Promise.allSettled(
            event.Records.map((record) =>
                eventHandler.handle({ fileKey: record.s3.object.key })
            )
        );

        const failedEvents = responses.filter(
            (event) => event.status === "rejected"
        );

        if (failedEvents.length > 0) {
            failedEvents.forEach((failedEvent) => {
                console.log(failedEvent);
            });
        }
    };
}
