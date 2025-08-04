import { getSchema } from "../kernel/decorators/Schema";

type TRouteType = "public" | "private";

export abstract class Controller<TType extends TRouteType, TBody = undefined> {
    abstract handle(
        params: Controller.HttpRequest<TType>
    ): Promise<Controller.HttpResponse<TBody>>;

    // Funciona como se fosse um proxy
    public execute(
        request: Controller.HttpRequest<TType>
    ): Promise<Controller.HttpResponse<TBody>> {
        const body = this.validateBody(request.body);

        return this.handle({
            ...request,
            body,
        });
    }

    private validateBody(body: Controller.HttpRequest<TRouteType>["body"]) {
        const schema = getSchema(this);
        if (!schema) {
            return body;
        }

        return schema.parse(body);
    }
}

export namespace Controller {
    type BaseType<
        TBody = Record<string, unknown>,
        TParams = Record<string, unknown>,
        TQueryParams = Record<string, unknown>
    > = {
        body: TBody;
        params: TParams;
        queryParams: TQueryParams;
    };

    type PublicRequest<
        TBody = Record<string, unknown>,
        TParams = Record<string, unknown>,
        TQueryParams = Record<string, unknown>
    > = BaseType<TBody, TParams, TQueryParams> & {
        accountId: null;
    };

    type PrivateRquest<
        TBody = Record<string, unknown>,
        TParams = Record<string, unknown>,
        TQueryParams = Record<string, unknown>
    > = BaseType<TBody, TParams, TQueryParams> & {
        accountId: string;
    };

    export type HttpRequest<
        TType extends TRouteType,
        TBody = Record<string, unknown>,
        TParams = Record<string, unknown>,
        TQueryParams = Record<string, unknown>
    > = TType extends "public"
        ? PublicRequest<TBody, TParams, TQueryParams>
        : PrivateRquest<TBody, TParams, TQueryParams>;

    export type HttpResponse<TBody = undefined> = {
        statusCode: number;
        body?: TBody;
    };
}

# Documentação do Controller e Tipagem Avançada

## 1. Objetivo

O Controller padroniza o tratamento de requisições HTTP, fornecendo tipagem forte e flexível para body, params e queryParams, além de distinguir entre rotas públicas e privadas.

---

## 2. Tipos Fundamentais

### 2.1 TRouteType

```typescript
type TRouteType = "public" | "private";
```
Define se a rota é pública ou privada.

---

### 2.2 Classe Controller

```typescript
export abstract class Controller<TType extends TRouteType, TBody = undefined> {
    abstract handle(
        params: Controller.HttpRequest<TType>
    ): Promise<Controller.HttpResponse<TBody>>;
    // ...existing code...
}
```

- **TType**: `"public"` ou `"private"`. Define o tipo da rota.
- **TBody**: Tipo do corpo da resposta (response body).

#### Por que só TType e TBody?
A classe Controller, do jeito atual, só aceita esses dois tipos genéricos. Os tipos de body, params e queryParams da requisição são definidos apenas no tipo `Controller.HttpRequest`, não na classe Controller em si.

---

### 2.3 Controller.HttpRequest

```typescript
export type HttpRequest<
    TType extends TRouteType,
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>
> = TType extends "public"
    ? PublicRequest<TBody, TParams, TQueryParams>
    : PrivateRquest<TBody, TParams, TQueryParams>;
```

- **TType**: `"public"` ou `"private"`.
- **TBody**: Tipo do body da requisição.
- **TParams**: Tipo dos parâmetros da rota.
- **TQueryParams**: Tipo dos query params.

Se não especificar, todos assumem `Record<string, unknown>`.

#### Exemplo:
```typescript
Controller.HttpRequest<"private", { foo: string }, { id: string }, { page: number }>
```
- `body: { foo: string }`
- `params: { id: string }`
- `queryParams: { page: number }`
- `accountId: string`

---

### 2.4 PublicRequest e PrivateRquest

```typescript
type PublicRequest<TBody, TParams, TQueryParams> = BaseType<TBody, TParams, TQueryParams> & { accountId: null };
type PrivateRquest<TBody, TParams, TQueryParams> = BaseType<TBody, TParams, TQueryParams> & { accountId: string };
```

- **PublicRequest**: Para rotas públicas, `accountId` é `null`.
- **PrivateRquest**: Para rotas privadas, `accountId` é `string`.

---

### 2.5 BaseType

```typescript
type BaseType<TBody, TParams, TQueryParams> = {
    body: TBody;
    params: TParams;
    queryParams: TQueryParams;
};
```
Define a estrutura base de uma requisição.

---

## 3. Por que repassar os tipos?

Mesmo que hoje só use `Record<string, unknown>`, repassar os tipos permite customizar no futuro, tornando o Controller flexível e seguro para diferentes formatos de requisição.

---

## 4. Como usar na prática

### 4.1 Tipando o Controller

Você pode criar um controller assim:

```typescript
class MyController extends Controller<"private", MyResponseType> {
    async handle(params: Controller.HttpRequest<"private">) {
        // params.body: Record<string, unknown>
        // params.params: Record<string, unknown>
        // params.queryParams: Record<string, unknown>
        // params.accountId: string
    }
}
```

Se quiser tipar body, params e queryParams:

```typescript
class MyController extends Controller<"private", MyResponseType> {
    async handle(
        params: Controller.HttpRequest<
            "private",
            { foo: string },
            { id: string },
            { page: number }
        >
    ) {
        // params.body: { foo: string }
        // params.params: { id: string }
        // params.queryParams: { page: number }
        // params.accountId: string
    }
}
```

---

### 4.2 O que acontece se não passar os tipos?

Se você não passar os tipos para `Controller.HttpRequest`, todos assumem `Record<string, unknown>`.
Exemplo:

```typescript
Controller.HttpRequest<"private">
```
É igual a:
```typescript
Controller.HttpRequest<"private", Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>
```

---

### 4.3 Como garantir tipagem forte?

Para garantir que body, params e queryParams estejam tipados corretamente, sempre passe os tipos explicitamente ao usar `Controller.HttpRequest`.

---

## 5. Dúvidas Frequentes

- **Por que existe o accountId?**
  Para diferenciar entre rotas públicas (accountId: null) e privadas (accountId: string).

- **Posso customizar os tipos?**
  Sim, basta passar os tipos desejados ao usar `Controller.HttpRequest`.

- **O que acontece se não customizar?**
  Os tipos padrão serão `Record<string, unknown>`, ou seja, objetos genéricos.

- **Preciso alterar a classe Controller para aceitar body, params e queryParams como genéricos?**
  Se quiser que a classe Controller já force esses tipos, sim. Do jeito atual, só o tipo `Controller.HttpRequest` aceita.

---

## 6. Exemplo Completo

```typescript
type MyBody = { foo: string };
type MyParams = { id: string };
type MyQuery = { page: number };

class MyController extends Controller<
    "private",
    MyResponseType
> {
    async handle(
        params: Controller.HttpRequest<"private", MyBody, MyParams, MyQuery>
    ) {
        // params.body: { foo: string }
        // params.params: { id: string }
        // params.queryParams: { page: number }
        // params.accountId: string
    }
}
```

---

## 7. Resumo

- Sempre que quiser tipagem forte, passe os tipos explicitamente.
- O Controller foi desenhado para ser flexível e seguro.
- Consulte este arquivo sempre que tiver dúvidas sobre tipagem de controllers!
