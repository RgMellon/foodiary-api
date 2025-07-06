import { Registry } from "@kernel/di/Registry";
import { Constructor } from "src/shared/types/constructor";

export function Injectable() {
    return (target: Constructor) => {
        Registry.getInstance().register(target as unknown as Constructor);
    };
}
