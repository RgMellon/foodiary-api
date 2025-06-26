import { z } from "zod";

export function Schema(schema: z.ZodSchema): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata("custom:schema", schema, target);
    };
}

export function getSchema(target: any): z.ZodSchema | undefined {
    //.constructor serve pra pegar a classe em si e não a instancia dela
    return Reflect.getMetadata("custom:schema", target.constructor);
}
