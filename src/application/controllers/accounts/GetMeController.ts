import { Profile } from "@application/entities/Profile";
import { GetProfileAndGoalQuery } from "@application/query/GetProfileAndGoalQuery";
import { Injectable } from "@kernel/decorators/Injectable";
import { Controller } from "src/contracts/Controller";

@Injectable()
export class GetMeController extends Controller<
    "private",
    GetMeController.Response
> {
    constructor(
        private readonly getProfileAndGoalQuery: GetProfileAndGoalQuery
    ) {
        super();
    }

    async handle({
        accountId,
    }: Controller.HttpRequest<"private">): Promise<
        Controller.HttpResponse<GetMeController.Response>
    > {
        const { goal, profile } = await this.getProfileAndGoalQuery.run({
            accountId,
        });
        return {
            statusCode: 200,
            body: {
                profile,
                goal,
            },
        };
    }
}

namespace GetMeController {
    export type Response = {
        profile: {
            name: string;
            birthDate: Date;
            gender: Profile.Gender;
            height: number;
            weight: number;
        };
        goal: {
            fat: number;
            carbohydrates: number;
            proteins: number;
            calories: number;
        };
    };
}
