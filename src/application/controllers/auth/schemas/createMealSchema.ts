import { z } from "zod";

export const createMealSchema = z.object({
    file: z.object({
        size: z
            .number()
            .min(1)
            .max(10 * 1024 * 1024, "The file should have up to 10MB"), // 10 mega
        type: z.enum(["audio/m4a", "image/jpeg"]),
    }),
});

export type CreateMealSchema = z.infer<typeof createMealSchema>;
