import { Goal } from "@application/entities/Goal";
import { AccountItem } from "./AccountItem";

export class GoalItem {
    static readonly type = "Goal";
    private readonly keys: GoalItem.KEYS;

    constructor(private readonly attrs: GoalItem.Attributes) {
        this.keys = {
            PK: GoalItem.getPk(this.attrs.accountId),
            SK: GoalItem.getSK(this.attrs.accountId),
        };
    }

    static fromEntity(goal: Goal) {
        return new GoalItem({
            ...goal,
            createdAt: goal.createdAt.toISOString(),
        });
    }

    static toEntity(goalItem: GoalItem.ItemType): Goal {
        return new Goal({
            ...goalItem,
            createdAt: new Date(goalItem.createdAt),
        });
    }

    toItem(): GoalItem.ItemType {
        return {
            ...this.keys,
            ...this.attrs,
            type: GoalItem.type,
        };
    }

    static getPk(accountId: string): GoalItem.KEYS["PK"] {
        return `ACCOUNT#${accountId}`;
    }

    static getSK(accountId: string): GoalItem.KEYS["SK"] {
        return `ACCOUNT#${accountId}#GOAL`;
    }
}

export namespace GoalItem {
    export type Attributes = {
        accountId: string;
        createdAt: string;
        proteins: number;
        fat: number;
        carbohydrates: number;
        calories: number;
    };

    export type KEYS = {
        PK: AccountItem.KEYS["PK"];
        SK: `ACCOUNT#${string}#GOAL`;
    };

    export type ItemType = Attributes &
        KEYS & {
            type: "Goal";
        };
}
