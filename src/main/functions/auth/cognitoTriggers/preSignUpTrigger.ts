/**
 * AWS Lambda handler for the Cognito Pre Sign-Up trigger.
 *
 * This function automatically confirms and verifies the user's email during the sign-up process.
 * It is typically used to bypass manual user confirmation and email verification steps,
 * streamlining the registration flow for trusted environments or specific use cases.
 *
 * @param event - The Cognito PreSignUpTriggerEvent containing user and request details.
 * @returns The modified event with `autoConfirmUser` and `autoVerifyEmail` set to `true`.
 */
import { PreSignUpTriggerEvent } from "aws-lambda";

export async function handler(event: PreSignUpTriggerEvent) {
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;

    return event;
}
