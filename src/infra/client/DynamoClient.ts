import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const DynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());
