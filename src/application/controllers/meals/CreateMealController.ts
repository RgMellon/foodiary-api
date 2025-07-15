import { Injectable } from "@kernel/decorators/Injectable";
import KSUID from "ksuid";
import { Controller } from "src/contracts/Controller";

@Injectable()
export class CreateMealController extends Controller<CreateMealController.Response> {
    async handle(): Promise<
        Controller.HttpResponse<CreateMealController.Response>
    > {
        return {
            statusCode: 200,
            body: {
                mealId: KSUID.randomSync().string,
            },
        };
    }
}

namespace CreateMealController {
    export type Response = {
        mealId: string;
    };
}
