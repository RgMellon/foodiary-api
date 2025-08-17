import { S3Event } from "aws-lambda";

export function handler(event: S3Event) {
    console.log(event);
}
