# JKTech

## Overview

This project is a NestJS-based gateway service for JKTech. It provides authentication, user management, document ingestion, and other core APIs. The codebase follows modular best practices and is designed for scalability and maintainability.

---

## Project Highlights

- All services are fully dockerized for seamless deployment.
- Automated testing, with code coverage consistently above 70%.
- Complete API documentation with examples data is available via Swagger.
- Modern design patterns (such as Dependency Injection, Repository Pattern, and modular architecture) are applied throughout the codebase for maintainability and scalability.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Automated Testing Structure](#automated-testing-structure)
- [Database](#database)
- [Security](#security)
- [Performance](#performance)
- [Contributing](#contributing)

---

## Getting Started

### Prerequisites

- Node.js >= 16.x
- npm >= 8.x
- PostgreSQL (or Docker for running containers)

---

## Running the Project

You can run the project in two ways:

### 1. With Docker (Recommended)

This will spin up all required services (gateway, mock-ingestion, database, etc.) in isolated containers.

1. Copy `.env.example` to `.env` in the project root and adjust environment variables as needed.
2. Run the following command from the project root:
   ```bash
   docker-compose up --build
   ```
3. The gateway service will be available at `http://localhost:3000`.
4. Swagger API docs: `http://localhost:3000/api`

**Stopping containers:**
```bash
docker-compose down
```

### 2. Without Docker (Manual Local Setup)

You can run each service directly on your machine. Make sure you have PostgreSQL running locally and update the `.env` files accordingly.

#### Steps:

1. Copy `.env.example` to `.env` in the gateway directory and set DB connection details for local (e.g., `localhost`).
2. Start the database (e.g., PostgreSQL) and ensure the credentials match your `.env`.
3. Run the services:
   - **Gateway:**
     ```bash
     cd gateway
     npm install
     npm run start:dev
     ```
   - **Mock-ingestion (if used):**
     ```bash
     cd mock-ingestion
     npm install
     npm run start:dev
     ```
5. The gateway service will be available at `http://localhost:3000`.
6. Swagger API docs: `http://localhost:3000/api`

---

## Project Structure

- `gateway/` - Main NestJS gateway service
   - `src/auth` - Authentication (JWT, RBAC)
   - `src/users` - User management
   - `src/ingestion` - Document ingestion
   - `src/documents` - Document services

- `mock-ingestion/` - Mock microservice for ingestion

---

## API Documentation

This project uses Swagger for API documentation. To view the docs, run the app and visit:

```
http://localhost:3000/api
```

---

## Deployment

- See the [Running the Project](#running-the-project) section for both Docker and manual instructions.

---

## Automated Testing Structure

This project uses automated tests with coverage above 70% to ensure code reliability and maintainability.

- **Unit & Integration Tests:**
  - Located in `*/src/**/__tests__` folders, next to the code they test.
  - Example (gateway): `gateway/src/users/__tests__/users.controller.spec.ts`
  - Example (mock-ingestion): `mock-ingestion/src/__tests__/app.controller.spec.ts`
- **End-to-End (E2E) Tests:**
  - Located in the `test/` directory at the project root.
  - Example: `test/app.e2e-spec.ts`
- **Test Framework:** [Jest](https://jestjs.io/) is used for all test types.

### Running Tests
```bash
cd gateway

# Run all unit and integration tests
npm run test

# Run end-to-end (E2E) tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

---

## Database

- Migrations and seeds are managed to match the latest schema.
---

## Security

- Centralized authentication in `auth` module.
- Role-based access control (RBAC) implemented.
- Sensitive data is hashed and never logged.

---

## Performance

- Modular structure allows for scaling.
- Profile and optimize slow queries.
- Add caching (e.g., Redis) if needed.

---

## Contributing

- Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT
