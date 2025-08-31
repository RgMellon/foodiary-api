# Fluxo de Processamento de Refeições (Meal Processing Flow)

Este documento explica o fluxo completo de processamento de refeições no Foodiary API, desde o upload da imagem até o processamento final.

## Visão Geral do Fluxo

```
1. Upload de Imagem → 2. Trigger S3 → 3. Fila SQS → 4. Processamento
```

## 1. Início do Processo: Upload de Imagem

### Endpoint: `POST /meals`
- **Handler**: `createMeal.handler`
- **Controller**: `CreateMealController`
- **Autenticação**: Cognito Authorizer

O usuário faz upload de uma imagem de refeição através do endpoint REST.

## 2. Trigger S3: onMealFileUploaded

### Configuração (sls/functions/meal.yml)
```yaml
onMealFileUploaded:
    handler: src/main/functions/meals/onMealFileUploaded.handler
    events:
        - s3:
              bucket: !Ref MealsBucket
              event: s3:ObjectCreated:*
```

### Fluxo do Trigger S3

1. **Evento S3** → Imagem é carregada no bucket `MealsBucket`
2. **Lambda S3 Adapter** → Converte evento S3 em chamada para handler
3. **MealUploadedFileEventHandler** → Processa o evento de upload
4. **MealUploadedUseCase** → Executa a lógica de negócio

### Código do Adapter S3
```typescript
// lambdaS3Adapter.ts
export function lambdaS3Adapter(eventHandler: IFileEventHandler): S3Handler {
    return async (event) => {
        await Promise.allSettled(
            event.Records.map((record) =>
                eventHandler.handle({ fileKey: record.s3.object.key })
            )
        );
    };
}
```

**Responsabilidades do Adapter S3:**
- Extrai `fileKey` do evento S3
- Chama o handler para cada record
- Trata erros com `Promise.allSettled`

## 3. Processamento do Upload: MealUploadedUseCase

### Fluxo Interno
1. **Extrai metadados** do arquivo usando `MealsFileStorageGateway`
2. **Busca a refeição** no DynamoDB usando `MealRepository`
3. **Atualiza status** para `QUEUED`
4. **Salva no banco** a refeição atualizada
5. **Publica mensagem** na fila SQS

```typescript
async execute({ fileKey }) {
    // 1. Extrai accountId e mealId dos metadados do arquivo
    const { accountId, mealId } = await this.mealsFileStorageGateway.getMetaData({ fileKey });
    
    // 2. Busca a refeição no banco
    const meal = await this.mealRespository.findById({ accountId, mealId });
    
    // 3. Atualiza status para QUEUED
    meal.status = Meal.Status.QUEUED;
    
    // 4. Salva no banco
    await this.mealRespository.save(meal);
    
    // 5. Publica na fila SQS
    await this.mealsQueue.publish({ accountId, mealId });
}
```

## 4. Fila SQS: MealsQueue

### Publicação de Mensagem
```typescript
// MealsQueue.ts
async publish(message: MealsQueue.Message) {
    const command = new SendMessageCommand({
        QueueUrl: this.appConfig.mealsQueue.mealsQueueUrl,
        MessageBody: JSON.stringify(message),
    });
    
    await sqsClient.send(command);
}
```

### Estrutura da Mensagem
```typescript
type Message = {
    accountId: string;
    mealId: string;
}
```

## 5. Processamento Final: processMeal

### Configuração (sls/functions/meal.yml)
```yaml
processMeal:
    handler: src/main/functions/meals/processMeal.handler
    memorySize: 1024 # 1GB para segurança
    timeout: 120     # 2 minutos
    events:
        - sqs:
              arn: !GetAtt MealsQueue.Arn
              batchSize: 2
```

### Fluxo do Processamento

1. **Trigger SQS** → Mensagem chega na fila
2. **Lambda SQS Adapter** → Converte evento SQS em chamadas
3. **MealsQueueConsumer** → Processa cada mensagem

### Código do Adapter SQS
```typescript
// lambdaSqsAdapter.ts
export function lambdaSqsAdapter(consumer: IQueueConsumer<any>): SQSHandler {
    return async (event) => {
        await Promise.all(
            event.Records.map(async (record) => {
                const message = JSON.parse(record.body);
                await consumer.process(message);
            })
        );
    };
}
```

**Responsabilidades do Adapter SQS:**
- Faz parse do JSON de cada record
- Chama `consumer.process()` para cada mensagem
- Processa em paralelo com `Promise.all`

### Consumer Atual
```typescript
// MealsQueueConsumer.ts
async process({ accountId, mealId }: MealsQueue.Message): Promise<void> {
    console.log(JSON.stringify({ accountId, mealId }, null, 2));
    // TODO: Implementar lógica de processamento
}
```

## Adapters Explicados

### 1. Lambda HTTP Adapter
- **Propósito**: Converte eventos HTTP do API Gateway em chamadas para controllers
- **Funcionalidades**:
  - Extrai `accountId` do JWT (Cognito)
  - Faz parse do body, params e query params
  - Trata erros (Zod, HttpError, ApplicationError)
  - Retorna resposta HTTP formatada

### 2. Lambda S3 Adapter
- **Propósito**: Converte eventos S3 em chamadas para handlers de arquivo
- **Funcionalidades**:
  - Extrai `fileKey` de cada record S3
  - Processa múltiplos records em paralelo
  - Trata erros individualmente com `Promise.allSettled`

### 3. Lambda SQS Adapter
- **Propósito**: Converte eventos SQS em chamadas para consumers
- **Funcionalidades**:
  - Faz parse do JSON de cada mensagem
  - Processa múltiplas mensagens em paralelo
  - Batch processing configurável (batchSize: 2)

## Resumo do Fluxo Completo

1. **Upload** → Usuário envia imagem via `POST /meals`
2. **S3 Trigger** → Imagem no S3 dispara `onMealFileUploaded`
3. **Processamento Upload** → Atualiza status para `QUEUED` e publica na fila
4. **SQS Trigger** → Mensagem na fila dispara `processMeal`
5. **Processamento Final** → Consumer processa a refeição (implementação pendente)

## Status da Refeição
- **CREATED** → Refeição criada
- **QUEUED** → Imagem processada, na fila para análise
- **PROCESSING** → Em processamento (futuro)
- **COMPLETED** → Processamento concluído (futuro)

## Próximos Passos
- Implementar lógica real no `MealsQueueConsumer`
- Adicionar análise nutricional
- Implementar reconhecimento de imagem
- Adicionar tratamento de erros mais robusto