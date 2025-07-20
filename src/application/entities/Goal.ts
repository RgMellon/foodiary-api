export class Goal {
    readonly createdAt: Date;

    calories: number;

    proteins: number;

    carbohydrates: number;

    fat: number;

    readonly accountId: string;

    constructor(attrs: Goal.Attributes) {
        this.calories = attrs.calories;
        this.proteins = attrs.proteins;
        this.carbohydrates = attrs.carbohydrates;
        this.fat = attrs.fat;
        this.accountId = attrs.accountId;
        this.createdAt = attrs.createdAt ?? new Date();
    }
}

export namespace Goal {
    export type Attributes = {
        accountId: string;
        createdAt?: Date;
        proteins: number;
        fat: number;
        carbohydrates: number;
        calories: number;
    };
}
