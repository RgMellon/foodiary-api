import { z } from "zod";

export const updateGoalSchema = z.object({
    calories: z.number().min(1, "[calories] min 1"),
    proteins: z.number().min(1, "[proteins] min 1"),
    carbohydrates: z.number().min(1, "[carbohydrates] min 1"),
    fat: z.number().min(1, "[fat] min 1"),
});

export type UpdateGoalBody = z.infer<typeof updateGoalSchema>;
