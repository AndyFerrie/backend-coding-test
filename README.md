# Backend Coding Test

This project is a Node.js/Express API written in TypeScript. It provides endpoints for working with company and employee data, using file-based storage and Zod for schema validation.

## Getting Started

### Prerequisites

- Node.js (v24.x required)

### Install Dependencies

```
npm install
```

## Running the Server

To start the API server:

```
npm start
```

The server will start on port 3000.

## Running Tests

This project uses Jest for testing. To run all tests:

```
npm test
```

Test files are located in the `tests/` directory and mirror the source structure.

## Project Structure

- `src/` — Source code (controllers, routes, services, schemas, types)
- `data/` — JSON data files for companies and employees
- `tests/` — Test files and fixtures

## Notes

- All business logic is in controllers.
- Data loading is handled by services.
- Validation is done with Zod schemas.
