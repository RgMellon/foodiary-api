# Sistema de Injeção de Dependência (Kernel)

Este documento explica o sistema de DI customizado do Foodiary API, baseado em decorators TypeScript e Reflect Metadata.

## Visão Geral

O sistema consiste em 3 componentes principais:
- **Registry**: Container de dependências (Singleton)
- **@Injectable**: Decorator para registrar classes
- **Reflect Metadata**: Extração automática de dependências

## 1. Registry - O Container de DI

### Singleton Pattern
```typescript
export class Registry {
    private static instance: Registry | undefined;
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new Registry();
        }
        return this.instance;
    }
}
```

**Por que Singleton?**
- Garante uma única instância do container em toda aplicação
- Mantém estado global das dependências registradas
- Evita conflitos entre diferentes partes do sistema

### Armazenamento de Providers
```typescript
private providers = new Map<string, Registry.Provider>();

type Provider = {
    impl: Constructor;     // Classe construtora
    deps: Constructor[];   // Array de dependências
};
```

**Estrutura do Provider:**
- `impl`: A classe que será instanciada
- `deps`: Lista de dependências extraídas via Reflect

## 2. Decorator @Injectable

### Funcionamento
```typescript
export function Injectable() {
    return (target: Constructor) => {
        Registry.getInstance().register(target as unknown as Constructor);
    };
}
```

**Fluxo de Execução:**
1. Decorator é aplicado na classe
2. Chama `Registry.register()` automaticamente
3. Registra a classe no container

### Exemplo de Uso
```typescript
@Injectable()
export class MealsQueueConsumer {
    constructor(private useCase: MealUploadedUseCase) {}
}

@Injectable() 
export class MealUploadedUseCase {
    constructor(
        private repository: MealRepository,
        private queue: MealsQueue
    ) {}
}
```

## 3. Reflect Metadata - Extração de Dependências

### Como Funciona
```typescript
register(impl: Constructor) {
    const token = impl.name;
    
    // ✨ MAGIA AQUI - Extrai tipos dos parâmetros do constructor
    const deps: Constructor<any>[] = 
        Reflect.getMetadata("design:paramtypes", impl) ?? [];
    
    this.providers.set(token, { impl, deps });
}
```

### Pré-requisito: reflect-metadata
```typescript
import "reflect-metadata"; // ← Deve estar no topo dos arquivos
```

**O que acontece:**
1. TypeScript compila e gera metadata dos tipos
2. `Reflect.getMetadata("design:paramtypes")` extrai os tipos do constructor
3. Retorna array com as classes das dependências

### Exemplo de Metadata Gerada
```typescript
// Classe original
@Injectable()
class MealService {
    constructor(
        private repo: MealRepository,    // ← Tipo: MealRepository
        private queue: MealsQueue       // ← Tipo: MealsQueue  
    ) {}
}

// Metadata extraída
deps = [MealRepository, MealsQueue] // Array de construtores
```

## 4. Resolução de Dependências

### Algoritmo Recursivo
```typescript
resolve<TImpl extends Constructor>(impl: TImpl): InstanceType<TImpl> {
    const provider = this.providers.get(impl.name);
    
    if (!provider) 
        throw new Error(`${impl.name} doesn't exist on provider`);
    
    // 🔄 RECURSÃO - Resolve cada dependência primeiro
    const dependencies = provider.deps.map((dep) => this.resolve(dep));
    
    // ✅ Instancia com dependências resolvidas
    const instance = new provider.impl(...dependencies);
    
    return instance;
}
```

### Fluxo de Resolução
```typescript
// Exemplo: Registry.resolve(MealService)

1. Busca MealService no Map
2. Encontra deps: [MealRepository, MealsQueue]
3. Resolve MealRepository recursivamente
   3.1. Busca MealRepository no Map  
   3.2. Resolve suas dependências...
4. Resolve MealsQueue recursivamente
5. Instancia: new MealService(mealRepo, mealsQueue)
```

## 5. Exemplo Completo de Uso

### Definição das Classes
```typescript
@Injectable()
export class DatabaseConnection {
    constructor() {
        console.log("Database connected");
    }
}

@Injectable()
export class MealRepository {
    constructor(private db: DatabaseConnection) {}
}

@Injectable()
export class MealService {
    constructor(private repository: MealRepository) {}
}
```

### Resolução
```typescript
// Em qualquer lugar da aplicação
const registry = Registry.getInstance();
const mealService = registry.resolve(MealService);

// Árvore de dependências criada automaticamente:
// MealService
//   └── MealRepository  
//       └── DatabaseConnection
```

## 6. Vantagens do Sistema

### ✅ **Automático**
- Não precisa configurar dependências manualmente
- Extração automática via Reflect Metadata

### ✅ **Type-Safe**
- TypeScript garante tipos corretos
- Erros em tempo de compilação

### ✅ **Simples**
- Apenas `@Injectable()` decorator
- Resolução com `Registry.resolve()`

### ✅ **Recursivo**
- Resolve dependências aninhadas automaticamente
- Suporta qualquer profundidade

## 7. Limitações

### ❌ **Dependências Circulares**
- Sistema não detecta ciclos
- Pode causar stack overflow

### ❌ **Sem Scopes**
- Todas instâncias são criadas na resolução
- Não há singleton por dependência

### ❌ **Sem Interfaces**
- Só funciona com classes concretas
- Não suporta abstrações

## 8. Configuração Necessária

### tsconfig.json
```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

### Imports Obrigatórios
```typescript
import "reflect-metadata"; // ← Sempre no topo dos entry points
```

## Resumo

O sistema de DI do Foodiary é um **container customizado** que:

1. **Registra** classes automaticamente com `@Injectable()`
2. **Extrai** dependências via Reflect Metadata
3. **Resolve** recursivamente toda árvore de dependências
4. **Instancia** objetos com dependências injetadas

É o **core do projeto** que permite arquitetura desacoplada e testável, eliminando a necessidade de instanciar dependências manualmente.