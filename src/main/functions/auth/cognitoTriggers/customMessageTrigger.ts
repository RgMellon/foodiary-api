import { CustomMessageTriggerEvent } from "aws-lambda";

export async function handler(event: CustomMessageTriggerEvent) {
    if (event.triggerSource === "CustomMessage_ForgotPassword") {
        const code = event.request.codeParameter;

        event.response.emailSubject = "foodiary | Recupere seu conta";
        event.response.emailMessage = `O seu código de recuperação é : ${code} `;
    }

    return event;
}
