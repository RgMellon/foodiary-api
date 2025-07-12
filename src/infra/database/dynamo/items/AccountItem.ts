import { Account } from "@application/entities/Account";

export class AccountItem {
    private readonly type = "ACCOUNT";
    private readonly keys: AccountItem.KEYS;

    constructor(private readonly attrs: AccountItem.Attributes) {
        this.keys = {
            PK: AccountItem.getPk(this.attrs.id),
            SK: AccountItem.getSK(this.attrs.id),
            GSI1PK: AccountItem.getGSI1PK(this.attrs.email),
            GSI1SK: AccountItem.getGSI1SK(this.attrs.email),
        };
    }

    static fromEntity(account: Account) {
        return new AccountItem({
            ...account,
            createdAt: account.createdAt.toISOString(),
        });
    }

    static toEntity(accountItem: AccountItem.ItemType): Account {
        return new Account({
            email: accountItem.email,
            externalId: accountItem.externalId,
            id: accountItem.id,
            createdAt: new Date(accountItem.createdAt),
        });
    }

    toItem(): AccountItem.ItemType {
        return {
            ...this.keys,
            ...this.attrs,
            type: this.type,
        };
    }

    static getPk(accountId: string): AccountItem.KEYS["PK"] {
        return `ACCOUNT#${accountId}`;
    }

    static getSK(accountId: string): AccountItem.KEYS["SK"] {
        return `ACCOUNT#${accountId}`;
    }

    static getGSI1PK(email: string): AccountItem.KEYS["GSI1PK"] {
        return `ACCOUNT#${email}`;
    }

    static getGSI1SK(email: string): AccountItem.KEYS["GSI1SK"] {
        return `ACCOUNT#${email}`;
    }
}

export namespace AccountItem {
    export type Attributes = {
        email: string;
        externalId: string;
        id: string;
        createdAt: string;
    };

    export type KEYS = {
        PK: `ACCOUNT#${string}`;
        SK: `ACCOUNT#${string}`;
        GSI1PK: `ACCOUNT#${string}`;
        GSI1SK: `ACCOUNT#${string}`;
    };

    export type ItemType = Attributes &
        KEYS & {
            type: "ACCOUNT";
        };
}
