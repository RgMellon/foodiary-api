export class Profile {
    readonly createdAt: Date;

    name: string;

    birthDate: Date;

    gender: Profile.Gender;

    height: number;

    weight: number;

    readonly activityLevel: Profile.ActivityLevel;

    readonly goal: Profile.Goal;

    accountId: string;

    constructor(attrs: Profile.Attributes) {
        this.activityLevel = attrs.activityLevel;
        this.goal = attrs.goal;
        this.birthDate = attrs.birthDate;
        this.name = attrs.name;
        this.gender = attrs.gender;
        this.height = attrs.height;
        this.weight = attrs.weight;
        this.accountId = attrs.accountId;
        this.createdAt = attrs.createdAt ?? new Date();
    }
}

export namespace Profile {
    export type Attributes = {
        accountId: string;
        createdAt?: Date;
        name: string;
        birthDate: Date;
        gender: Gender;
        height: number;
        weight: number;
        activityLevel: ActivityLevel;
        goal: Goal;
    };

    export enum Gender {
        MALE = "MALE",
        FEMALE = "FEMALE",
    }

    export enum ActivityLevel {
        SEDENTARY = "SEDENTARY",
        LIGHT = "LIGHT",
        MODERATE = "MODERATE",
        HEAVY = "HEAVY",
        ATHLETE = "ATHLETE",
    }

    export enum Goal {
        MAINTAIN = "MAINTAIN",
        LOSE = "LOSE",
        GAIN = "GAIN",
    }
}
