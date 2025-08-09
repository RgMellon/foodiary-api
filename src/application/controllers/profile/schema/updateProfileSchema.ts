import { Profile } from "@application/entities/Profile";
import { z } from "zod";

export const updateProfileSchema = z.object({
    birthDate: z
        .string()
        .min(1, "[birthDate] is required")
        .date("[birthDate] should 'YYYY-MM-AA'")
        .transform((date) => new Date(date)),
    name: z.string().min(1, "[name] is required"),
    height: z.number().min(1, "[height] is required"),
    weight: z.number().min(1, "[weight] is required"),
    gender: z.nativeEnum(Profile.Gender),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
