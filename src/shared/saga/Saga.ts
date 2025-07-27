import { Injectable } from "@kernel/decorators/Injectable";

/**
 * Saga
 *
 * Implementa o padrão Saga para orquestração de transações distribuídas e reversão de operações em caso de falha.
 *
 * O padrão Saga é utilizado quando múltiplas operações precisam ser realizadas de forma coordenada, mas não é possível garantir atomicidade
 * como em uma transação tradicional de banco de dados. Cada operação pode registrar uma função de compensação, que será executada caso
 * alguma etapa subsequente falhe, permitindo desfazer (compensar) as operações já realizadas.
 *
 * Nesta implementação:
 * - Use `addCompensation` para registrar funções de compensação, que serão executadas em ordem reversa (LIFO) em caso de erro.
 * - O método `run` executa a lógica principal e, se ocorrer uma exceção, chama `compensate` para executar todas as compensações registradas.
 * - Durante a compensação, falhas em uma etapa não impedem a execução das demais, garantindo robustez no rollback.
 *
 * Exemplo de uso:
 * const saga = new Saga();
 * saga.addCompensation(async () => desfazerOperacao1());
 * saga.addCompensation(async () => desfazerOperacao2());
 * await saga.run(async () => {
 *   await operacao1();
 *   await operacao2();
 * });
 */

@Injectable()
export class Saga {
    private compensations: (() => Promise<void>)[] = [];

    addCompensation(fn: () => Promise<void>) {
        this.compensations.unshift(fn);
    }

    async run<TResult>(fn: () => Promise<TResult>) {
        try {
            return await fn();
        } catch (err) {
            await this.compensate();
            throw err;
        }
    }

    private async compensate() {
        for await (const compensation of this.compensations) {
            try {
                await compensation();
            } catch {
                //
            }
        }
    }
}
