import { Profile } from "@application/entities/Profile";
import { z } from "zod";

export const signupSchema = z.object({
    account: z.object({
        email: z.string().min(1).email(),
        password: z.string().min(8, "no  mínimo 8 characteres"),
    }),
    profile: z.object({
        goal: z.nativeEnum(Profile.Goal),
        birthDate: z
            .string()
            .min(1, "[birthDate] is required")
            .date("[birthDate] should 'YYYY-MM-AA'")
            .transform((date) => new Date(date)),
        name: z.string().min(1, "[name] is required"),
        gender: z.nativeEnum(Profile.Gender),
        height: z.number().min(1, "[height] is required"),
        weight: z.number().min(1, "[weight] is required"),
        activityLevel: z.nativeEnum(Profile.ActivityLevel),
    }),
});

export type SignUpBody = z.infer<typeof signupSchema>;
