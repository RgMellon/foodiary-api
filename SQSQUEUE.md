# Documentação da Configuração SQS – MealsQueue.yml

Este arquivo define duas filas SQS: uma principal (`MealsQueue`) e uma Dead Letter Queue (`MealsDLQ`).
Abaixo, explicação de cada configuração:

---

## MealsQueue

- **Type: AWS::SQS::Queue**
  - Indica que o recurso é uma fila SQS.

- **Properties:**
  - **QueueName:**
    Nome da fila, gerado dinamicamente usando o nome do serviço e o stage do deploy.
    Exemplo: `foodiary-api-dev-MealsQueue`
  - **VisibilityTimeout:**
    Tempo (em segundos) que uma mensagem fica invisível após ser lida por um consumidor.
    Aqui, 130 segundos.
  - **ReceiveMessageWaitTimeSeconds:**
    Tempo máximo (em segundos) que o SQS espera por mensagens antes de retornar uma resposta vazia.
    Aqui, 20 segundos (long polling).
  - **RedrivePolicy:**
    Configuração para envio de mensagens para a Dead Letter Queue (DLQ) após falhas.
    - **maxReceiveCount:**
      Número máximo de tentativas de processamento antes de enviar para a DLQ.
      Aqui, 2 tentativas.
    - **deadLetterTargetArn:**
      ARN da fila DLQ para onde as mensagens serão enviadas após exceder o número de tentativas.

---

## MealsDLQ

- **Type: AWS::SQS::Queue**
  - Fila SQS usada como Dead Letter Queue.

- **Properties:**
  - **QueueName:**
    Nome da DLQ, também gerado dinamicamente.
    Exemplo: `foodiary-api-dev-MealsDLQ`
  - **MessageRetentionPeriod:**
    Tempo (em segundos) que as mensagens permanecem na DLQ antes de serem excluídas.
    Aqui, 1.209.600 segundos (14 dias).

---

## Conceitos Importantes

- **Dead Letter Queue (DLQ):**
  Fila para onde vão mensagens que não puderam ser processadas com sucesso após várias tentativas.
  Ajuda a evitar perda de dados e facilita análise de erros.

- **Visibility Timeout:**
  Evita que múltiplos consumidores processem a mesma mensagem simultaneamente.

- **Redrive Policy:**
  Define como e quando mensagens falham e são enviadas para a DLQ.

- **Long Polling:**
  Reduz chamadas vazias e custos, pois o SQS espera até que uma mensagem esteja disponível ou o tempo máximo expire.

---

## Referências

- [AWS SQS Documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html)
- [Dead Letter Queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html)
- [Visibility Timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)
