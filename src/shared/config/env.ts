import { z } from "zod";

export const schema = z.object({
    COGNITO_CLIENT_ID: z.string().min(1),
});

function getEnv() {
    try {
        return schema.parse(process.env);
    } catch {
        throw new Error("Cannot validate env var");
    }
}

export const env = getEnv();
