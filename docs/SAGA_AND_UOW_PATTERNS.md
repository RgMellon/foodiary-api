# Padrões Saga e Unit of Work (UOW)

Este documento explica os padrões **Saga** e **Unit of Work** implementados no Foodiary API, especificamente no fluxo de signup de usuários.

## Visão Geral

### **Problema Resolvido**
O signup de usuário envolve múltiplas operações que precisam ser **atômicas** e **reversíveis**:
1. Criar usuário no Cognito (serviço externo)
2. Salvar Account, Profile e Goal no DynamoDB (múltiplas tabelas)
3. Fazer login automático

Se qualquer etapa falhar, **todas as anteriores devem ser desfeitas** para manter consistência.

## 1. Padrão Saga

### **O que é**
Padrão para **orquestração de transações distribuídas** com capacidade de **compensação** (rollback) em caso de falha.

### **Implementação no Projeto**

```typescript
// src/shared/saga/Saga.ts
@Injectable()
export class Saga {
    private compensations: (() => Promise<void>)[] = [];

    addCompensation(fn: () => Promise<void>) {
        this.compensations.unshift(fn); // LIFO - última compensação primeiro
    }

    async run<TResult>(fn: () => Promise<TResult>) {
        try {
            return await fn();
        } catch (err) {
            await this.compensate(); // Executa todas as compensações
            throw err;
        }
    }

    private async compensate() {
        for await (const compensation of this.compensations) {
            try {
                await compensation();
            } catch {
                // Ignora erros de compensação para não interromper rollback
            }
        }
    }
}
```

### **Uso no SignUpUseCase**

```typescript
async execute({ account, profile }) {
    return this.saga.run(async () => {
        // 1. Validações
        const emailAlreadyUsed = await this.accountRepository.findByEmail(email);
        if (emailAlreadyUsed) throw new EmailAlreadyUsed();

        // 2. Criar entidades
        const account = new Account({ email });
        const profile = new Profile({ ...profileData, accountId: account.id });
        const goal = new Goal({ accountId: account.id, ... });

        // 3. Criar usuário no Cognito
        const { externalId } = await this.authGateway.signUp({
            email, password, internalId: account.id
        });

        // 4. ✨ REGISTRA COMPENSAÇÃO - se algo falhar depois, remove usuário do Cognito
        this.saga.addCompensation(() => 
            this.authGateway.removeUser({ externalId })
        );

        // 5. Salvar no DynamoDB (transação atômica)
        account.externalId = externalId;
        await this.signupUow.run({ account, goal, profile });

        // 6. Login automático
        const { accessToken, refreshToken } = await this.authGateway.signIn({
            email, password
        });

        return { accessToken, refreshToken };
    });
}
```

### **Fluxo de Compensação**

```
✅ Cenário de Sucesso:
1. Criar usuário Cognito → ✅
2. Salvar DynamoDB → ✅  
3. Login → ✅
Resultado: Tudo OK

❌ Cenário de Falha:
1. Criar usuário Cognito → ✅
2. Salvar DynamoDB → ❌ FALHA
3. Saga executa compensação → Remove usuário do Cognito
Resultado: Estado consistente (como se nada tivesse acontecido)
```

## 2. Padrão Unit of Work (UOW)

### **O que é**
Padrão que **agrupa múltiplas operações de banco** em uma **única transação atômica**.

### **Implementação Base**

```typescript
// src/infra/database/dynamo/uow/UnityOfWork.ts
export abstract class UnityOfWork {
    private transactionItems: TransactWriteCommandInput["TransactItems"] = [];

    protected addPut(putInput: PutCommandInput) {
        this.transactionItems?.push({
            Put: putInput
        });
    }

    protected async commit() {
        const command = new TransactWriteCommand({
            TransactItems: this.transactionItems
        });

        await DynamoClient.send(command); // ✨ Transação atômica no DynamoDB
    }
}
```

### **Implementação Específica para SignUp**

```typescript
// src/infra/database/dynamo/uow/SignUpUnityOfWork.ts
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
        // Adiciona todas as operações na mesma transação
        this.addPut(this.accountRepository.getPutCommandInput(account));
        this.addPut(this.profileRepository.getPutCommandInput(profile));
        this.addPut(this.goalRepository.getPutCommandInput(goal));

        // Executa tudo de uma vez - ou tudo funciona, ou nada é salvo
        this.commit();
    }
}
```

### **Vantagens do UOW**

#### **Atomicidade**
```typescript
// ❌ Sem UOW - Risco de inconsistência
await accountRepository.save(account);  // ✅ Salvo
await profileRepository.save(profile);  // ❌ Falha
await goalRepository.save(goal);        // ❌ Não executa
// Resultado: Account salvo, mas Profile e Goal não = INCONSISTENTE

// ✅ Com UOW - Tudo ou nada
await signupUow.run({ account, profile, goal });
// Se qualquer operação falhar, NADA é salvo = CONSISTENTE
```

#### **Performance**
- **1 chamada** ao DynamoDB em vez de 3
- Menos latência de rede
- Melhor throughput

## 3. Integração dos Padrões

### **Como Trabalham Juntos**

```typescript
// Fluxo completo no SignUpUseCase
return this.saga.run(async () => {
    // Operações externas (Cognito)
    const { externalId } = await this.authGateway.signUp(...);
    
    // Registra compensação para operação externa
    this.saga.addCompensation(() => 
        this.authGateway.removeUser({ externalId })
    );
    
    // Operações internas (DynamoDB) - atômicas via UOW
    await this.signupUow.run({ account, goal, profile });
    
    // Mais operações...
});
```

### **Responsabilidades**

| Padrão | Responsabilidade | Escopo |
|--------|------------------|--------|
| **Saga** | Coordenação geral + Compensação | Operações distribuídas |
| **UOW** | Transação atômica | Operações de banco |

## 4. Por que Usar no Signup?

### **Complexidade do Signup**
```
1. Validar email único
2. Criar usuário no Cognito (serviço externo)
3. Salvar Account no DynamoDB
4. Salvar Profile no DynamoDB  
5. Calcular e salvar Goal no DynamoDB
6. Fazer login automático
```

### **Riscos sem os Padrões**
- **Usuário no Cognito** mas **sem dados no DynamoDB**
- **Dados parciais** salvos (só Account, sem Profile/Goal)
- **Estado inconsistente** difícil de recuperar

### **Benefícios com os Padrões**
- ✅ **Atomicidade** - tudo funciona ou nada acontece
- ✅ **Consistência** - estado sempre válido
- ✅ **Recuperação automática** - rollback em caso de falha
- ✅ **Performance** - menos chamadas ao banco

## 5. Cenários de Teste

### **Teste 1: Falha no DynamoDB**
```
1. Criar usuário Cognito ✅
2. Salvar DynamoDB ❌ (falha de rede)
3. Saga remove usuário do Cognito ✅
Resultado: Estado limpo, usuário pode tentar novamente
```

### **Teste 2: Falha no Login**
```
1. Criar usuário Cognito ✅
2. Salvar DynamoDB ✅
3. Login automático ❌ (Cognito indisponível)
4. Saga remove usuário do Cognito ✅
Resultado: Dados não ficam órfãos
```

## 6. Resumo

### **Saga Pattern**
- **Quando usar**: Operações distribuídas que precisam de rollback
- **Como funciona**: Registra compensações e executa em caso de falha
- **Benefício**: Consistência entre serviços externos

### **Unit of Work Pattern**  
- **Quando usar**: Múltiplas operações de banco que devem ser atômicas
- **Como funciona**: Agrupa operações em uma transação
- **Benefício**: Atomicidade e performance

### **Juntos no Signup**
Garantem que o cadastro de usuário seja **robusto**, **consistente** e **recuperável**, mesmo com falhas em qualquer etapa do processo complexo.