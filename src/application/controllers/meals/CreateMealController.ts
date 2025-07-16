import { Injectable } from "@kernel/decorators/Injectable";
import { Controller } from "src/contracts/Controller";

@Injectable()
export class CreateMealController extends Controller<
    "private",
    CreateMealController.Response
> {
    async handle({
        accountId,
    }: Controller.HttpRequest<"private">): Promise<
        Controller.HttpResponse<CreateMealController.Response>
    > {
        return {
            statusCode: 200,
            body: {
                accountId: accountId,
            },
        };
    }
}

namespace CreateMealController {
    export type Response = {
        accountId: string;
    };
}
