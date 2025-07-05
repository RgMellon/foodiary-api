import { z } from "zod";

export const signupSchema = z.object({
    account: z.object({
        email: z.string().min(1).email(),
        password: z.string().min(8, "no  mínimo 8 characteres"),
    }),
});

export type SignUpBody = z.infer<typeof signupSchema>;
