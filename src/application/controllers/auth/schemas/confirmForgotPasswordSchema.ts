import { z } from "zod";

export const confirmForgotPassword = z.object({
    email: z.string().min(1).email(),
    code: z.string().min(1),
    password: z.string().min(8),
});

export type ConfirmForgotPasswordBody = z.infer<typeof confirmForgotPassword>;
