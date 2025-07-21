import { Account } from "@application/entities/Account";
import { Goal } from "@application/entities/Goal";
import { Profile } from "@application/entities/Profile";
import { Injectable } from "@kernel/decorators/Injectable";
import { AccountRepository } from "../repositories/AccountRepository";
import { GoalRepository } from "../repositories/GoalRepository";
import { ProfileRepository } from "../repositories/ProfileRepository";
import { UnityOfWork } from "./UnityOfWork";

@Injectable()
export class SignUpUnityOfWork extends UnityOfWork {
    constructor(
        private readonly profileRepository: ProfileRepository,
        private readonly accountRepository: AccountRepository,
        private readonly goalRepository: GoalRepository
    ) {
        super();
    }

    async run({ account, goal, profile }: SignUpUnityOfWork.RunParams) {
        this.addPut(this.accountRepository.getPutCommandInput(account));
        this.addPut(this.profileRepository.getPutCommandInput(profile));
        this.addPut(this.goalRepository.getPutCommandInput(goal));
        
        this.commit();
    }
}

namespace SignUpUnityOfWork {
    export type RunParams = {
        account: Account;
        profile: Profile;
        goal: Goal;
    };
}
