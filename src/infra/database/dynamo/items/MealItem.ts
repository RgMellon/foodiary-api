import { Meal } from "@application/entities/Meal";

export class MealItem {
    private readonly type = "Meal";
    private readonly keys: MealItem.KEYS;

    constructor(private readonly attrs: MealItem.Attributes) {
        this.keys = {
            PK: MealItem.getPk(this.attrs.id),
            SK: MealItem.getSK(this.attrs.id),
            GSI1PK: MealItem.getGSI1PK({
                accountId: attrs.accountId,
                date: new Date(attrs.createdAt),
            }),
            GSI1SK: MealItem.getGSI1SK(this.attrs.id),
        };
    }

    static fromEntity(meal: Meal) {
        return new MealItem({
            ...meal,
            createdAt: meal.createdAt.toISOString(),
        });
    }

    static toEntity(mealItem: MealItem.ItemType): Meal {
        return new Meal({
            accountId: mealItem.accountId,
            attempts: mealItem.attempts,
            foods: mealItem.foods,
            icon: mealItem.icon,
            inputFileKey: mealItem.inputFileKey,
            inputType: mealItem.inputType,
            id: mealItem.id,
            createdAt: new Date(mealItem.createdAt),
            status: mealItem.status,
            name: mealItem.name,
        });
    }

    toItem(): MealItem.ItemType {
        return {
            ...this.keys,
            ...this.attrs,
            type: this.type,
        };
    }

    static getPk(mealId: string): MealItem.KEYS["PK"] {
        return `MEAL#${mealId}`;
    }

    static getSK(mealId: string): MealItem.KEYS["SK"] {
        return `MEAL#${mealId}`;
    }

    static getGSI1PK({
        accountId,
        date,
    }: MealItem.GS1PKParams): MealItem.KEYS["GSI1PK"] {
        const year = date.getFullYear();
        const month = String(date.getMonth()).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `MEALS#${accountId}#${year}-${month}-${day}`;
    }

    static getGSI1SK(id: string): MealItem.KEYS["GSI1SK"] {
        return `MEAL#${id}`;
    }
}

export namespace MealItem {
    export type Attributes = {
        id: string;
        accountId: string;
        status: Meal.Status;
        inputType: Meal.InputType;
        inputFileKey: string;
        attempts: number;
        icon: string;
        foods: Meal.Food[];
        createdAt: string;
        name: string;
    };

    export type KEYS = {
        PK: `MEAL#${string}`;
        SK: `MEAL#${string}`;
        GSI1PK: `MEALS#${string}#${string}-${string}-${string}`;
        GSI1SK: `MEAL#${string}`;
    };

    export type ItemType = Attributes &
        KEYS & {
            type: "Meal";
        };

    export type GS1PKParams = {
        accountId: string;
        date: Date;
    };
}
