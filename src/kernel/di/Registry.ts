import { Constructor } from "src/shared/types/constructor";

export class Registry {
    private static instance: Registry | undefined;

    private constructor() {}

    static getInstance() {
        if (!this.instance) {
            this.instance = new Registry();
        }

        return this.instance;
    }

    // aqui eu salvo a instancia
    private providers = new Map<string, Registry.Provider>();

    register(impl: Constructor) {
        const token = impl.name;

        if (this.providers.get(token)) {
            throw new Error(`${impl.name} already registered`);
        }

        const deps: Constructor<any>[] =
            Reflect.getMetadata("design:paramtypes", impl) ?? [];

        this.providers.set(token, {
            impl,
            deps,
        });
    }

    resolve<TImpl extends Constructor>(impl: TImpl): InstanceType<TImpl> {
        const provider = this.providers.get(impl.name);

        if (!provider)
            throw new Error(`${impl.name} doesn't exist on provider`);

        const dependencies = provider.deps.map((dep) => this.resolve(dep));

        const instance = new provider.impl(...dependencies);

        return instance;
    }
}

namespace Registry {
    export type Provider = {
        impl: Constructor;
        deps: Constructor[];
    };
}
