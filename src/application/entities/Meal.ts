import KSUID from "ksuid";

export class Meal {
    readonly createdAt: Date;

    readonly id: string;

    readonly accountId: string;

    status: Meal.Status;

    inputType: Meal.InputType;

    inputFileKey: string;

    attempts: number;

    icon: string;

    foods: Meal.Food[];

    constructor(attrs: Meal.Attributes) {
        this.accountId = attrs.accountId;
        this.createdAt = attrs.createdAt ?? new Date();
        this.status = attrs.status;
        this.inputType = attrs.inputType;
        this.inputFileKey = attrs.inputFileKey;
        this.attempts = attrs.attempts;
        this.icon = attrs.icon;
        this.id = attrs.id ?? KSUID.randomSync().string;
        this.foods = attrs.foods;
    }
}

export namespace Meal {
    export type Attributes = {
        id: string;
        accountId: string;
        createdAt?: Date;
        status: Status;
        inputType: InputType;
        inputFileKey: string;
        attempts: number;
        icon: string;
        foods: Meal.Food[];
    };

    export enum Status {
        PENDING = "PENDING",
        QUEUED = "QUEUED",
        PROCESSING = "PROCESSING",
        SUCCESS = "SUCESS",
        FAILED = "FAILED",
    }

    export enum InputType {
        AUDIO = "AUDIO",
        PICTURE = "PICTURE",
    }

    export type Food = {
        name: string;
        calories: number;
        fat: number;
        proteins: number;
        carbohydrates: number;
        quantity: string;
    };
}
