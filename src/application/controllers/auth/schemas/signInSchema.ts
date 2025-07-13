import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().min(1).email(),
    password: z.string().min(8, "no  mínimo 8 characteres"),
});

export type SignInBody = z.infer<typeof signInSchema>;
