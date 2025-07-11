import KSUID from "ksuid";

export class Account {
    readonly id: string;

    readonly email: string;

    externalId: string;

    constructor(attrs: Account.Attributes) {
        this.email = attrs.email;
        this.externalId = attrs.externalId;
        this.id = KSUID.randomSync().string;
    }
}

export  namespace Account {
    export type Attributes = {
        email: string;
        externalId: string;
    };
}
