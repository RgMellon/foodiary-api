import { Profile } from "@application/entities/Profile";
import { Injectable } from "@kernel/decorators/Injectable";
import { ProfileRepository } from "src/infra/database/dynamo/repositories/ProfileRepository";

@Injectable()
export class UpdateProfile {
    constructor(private readonly profileRepository: ProfileRepository) {}

    async execute(input: UpdateProfile.Input): Promise<UpdateProfile.Output> {
        const profile = await this.profileRepository.findByAccountId(
            input.accountId
        );

        profile.name = input.name;
        profile.birthDate = input.birthDate;
        profile.height = input.height;
        profile.weight = input.weight;
        profile.gender = input.gender;
        return await this.profileRepository.save(profile);
    }
}

export namespace UpdateProfile {
    export type Input = {
        accountId: string;
        name: string;
        birthDate: Date;
        weight: number;
        gender: Profile.Gender;
        height: number;
    };

    export type Output = void;
}
