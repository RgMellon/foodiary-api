import { z } from "zod";

export const listMealByDaySchema = z.object({
    day: z
        .string()
        .min(1, "[day] is required")
        .date("[day] should 'YYYY-MM-AA'")
        .transform((date) => new Date(date)),
});
