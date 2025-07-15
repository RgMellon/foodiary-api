import { PreTokenGenerationV2TriggerEvent } from "aws-lambda";
/**
 * AWS Cognito Pre Token Generation Trigger handler.
 *
 * Esta função é executada automaticamente pelo Cognito antes de gerar o token de acesso do usuário.
 * O objetivo é adicionar ou sobrescrever claims personalizados no token JWT, como o `internalId`.
 * Isso permite que informações internas da aplicação sejam incluídas no token, facilitando a identificação
 * do usuário em chamadas subsequentes sem expor dados sensíveis.
 *
 * Neste exemplo, o claim `internalId` é adicionado (com valor vazio, podendo ser preenchido conforme a lógica da aplicação).
 * Modifique conforme necessário para incluir outros claims relevantes para sua aplicação.
 *
 * @param event Evento disparado pelo Cognito contendo informações do usuário e contexto da autenticação.
 * @returns O evento modificado, incluindo os claims personalizados para o token.
 */

export async function handler(event: PreTokenGenerationV2TriggerEvent) {
    event.response = {
        claimsAndScopeOverrideDetails: {
            accessTokenGeneration: {
                claimsToAddOrOverride: {
                    internalId: "teste internal id",
                },
            },
        },
    };

    return event;
}
