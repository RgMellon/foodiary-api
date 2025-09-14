import { Registry } from "@kernel/di/Registry";
import { S3Handler } from "aws-lambda";
import { IFileEventHandler } from "src/contracts/IFileEventHandler";
import { Constructor } from "src/shared/types/constructor";

export function lambdaS3Adapter(
    eventHandlerImp: Constructor<IFileEventHandler>
): S3Handler {
    const eventHandler = Registry.getInstance().resolve(eventHandlerImp);

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
