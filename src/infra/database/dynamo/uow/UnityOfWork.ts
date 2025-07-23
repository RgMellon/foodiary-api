/**
 * UnityOfWork
 *
 * Implementa o padrão Unit of Work para garantir a consistência e integridade das operações de escrita no DynamoDB.
 *
 * O principal objetivo dessa implementação é agrupar múltiplas operações (como inserts, updates e deletes) em uma única transação.
 * Assim, todas as alterações são aplicadas de uma vez só, evitando que o banco de dados fique em um estado inconsistente caso alguma operação falhe.
 *
 * Na prática, isso é fundamental em cenários onde precisamos persistir dados em diferentes tabelas ou entidades de forma atômica,
 * como no cadastro de um novo usuário, onde criamos registros em Account, Profile e Goal simultaneamente.
 *
 * Caso alguma dessas operações falhe, nenhuma alteração é persistida, garantindo a integridade dos dados.
 */

import {
    PutCommandInput,
    TransactWriteCommand,
    TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { DynamoClient } from "src/infra/client/DynamoClient";

export abstract class UnityOfWork {
    private transactionItems: NonNullable<
        TransactWriteCommandInput["TransactItems"]
    > = [];

    protected addPut(putInput: PutCommandInput) {
        this.transactionItems?.push({
            Put: putInput,
        });
    }

    protected async commit() {
        const command = new TransactWriteCommand({
            TransactItems: this.transactionItems,
        });

        await DynamoClient.send(command);
    }
}
