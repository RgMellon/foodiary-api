# Foodiary API

A serverless Node.js HTTP API built with TypeScript, AWS Lambda, and API Gateway using the Serverless Framework.

## Features

- **TypeScript** for type safety and modern JavaScript features
- **Serverless Framework** for easy deployment to AWS Lambda
- **Zod** for schema validation
- **Dependency Injection** with custom decorators
- **Modular architecture** for controllers, use cases, and error handling

## Project Structure

```
src/
  application/
    controllers/      # API controllers
    errors/           # Custom error classes and codes
    schemas/          # Zod schemas for validation
    usecases/         # Business logic
  contracts/          # Shared interfaces (e.g., Controller)
  kernel/             # Core framework (DI, decorators, types)
  main/
    adapter/          # Lambda adapters
    functions/        # Lambda entrypoints
    utils/            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```sh
npm install
```

### Type checking

```sh
npm run typecheck
```

### Deploy to AWS

```sh
npx serverless deploy
```

### Local Development

Start the local serverless emulator:

```sh
npx serverless dev
```

### Example Request

Send a POST request to `/hello`:

```sh
curl -X POST https://<your-api-id>.execute-api.<region>.amazonaws.com/hello \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

## License

MIT