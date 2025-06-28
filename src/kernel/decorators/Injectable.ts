import { Registry } from "@kernel/di/Registry";
import { Constructor } from "@kernel/shared/types/Constructor";

export function Injectable() {
    return (target: Constructor) => {
        Registry.getInstance().register(target as unknown as Constructor);
    };
}
