import KSUID from "ksuid";

export class Account {
    readonly id: string;

    readonly email: string;

    externalId: string;

    readonly createdAt: Date;

    constructor(attrs: Account.Attributes) {
        this.email = attrs.email;
        this.externalId = attrs.externalId;
        this.id = attrs.id ?? KSUID.randomSync().string;
        this.createdAt = attrs.createdAt ?? new Date();
    }
}

export namespace Account {
    export type Attributes = {
        email: string;
        externalId: string;
        id?: string;
        createdAt?: Date;
    };
}
