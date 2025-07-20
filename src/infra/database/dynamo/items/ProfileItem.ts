import { Profile } from "@application/entities/Profile";
import { AccountItem } from "./AccountItem";

export class ProfileItem {
    private readonly type = "Profile";
    private readonly keys: ProfileItem.KEYS;

    constructor(private readonly attrs: ProfileItem.Attributes) {
        this.keys = {
            PK: ProfileItem.getPk(this.attrs.accountId),
            SK: ProfileItem.getSK(this.attrs.accountId),
        };
    }

    static fromEntity(profile: Profile) {
        return new ProfileItem({
            ...profile,
            createdAt: profile.createdAt.toISOString(),
            birthDate: profile.birthDate.toISOString(),
        });
    }

    static toEntity(profileItem: ProfileItem.ItemType): Profile {
        return new Profile({
            createdAt: new Date(profileItem.createdAt),
            birthDate: new Date(profileItem.birthDate),
            accountId: profileItem.accountId,
            activityLevel: profileItem.activityLevel,
            gender: profileItem.gender,
            goal: profileItem.goal,
            height: profileItem.height,
            name: profileItem.name,
            weight: profileItem.weight,
        });
    }

    toItem(): ProfileItem.ItemType {
        return {
            ...this.keys,
            ...this.attrs,
            type: this.type,
        };
    }

    static getPk(accountId: string): ProfileItem.KEYS["PK"] {
        return `ACCOUNT#${accountId}`;
    }

    static getSK(accountId: string): ProfileItem.KEYS["SK"] {
        return `ACCOUNT#${accountId}#PROFILE`;
    }
}

export namespace ProfileItem {
    export type Attributes = {
        accountId: string;
        name: string;
        birthDate: string;
        gender: Profile.Gender;
        height: number;
        weight: number;
        activityLevel: Profile.ActivityLevel;
        goal: Profile.Goal;
        createdAt: string;
    };

    export type KEYS = {
        PK: AccountItem.KEYS["PK"];
        SK: `ACCOUNT#${string}#PROFILE`;
    };

    export type ItemType = Attributes &
        KEYS & {
            type: "Profile";
        };
}
