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

## API Documentation

### Base URL

```
http://localhost:3000
```

### Endpoints

#### GET /companies

Returns a paginated list of companies, with optional filters.

**Query Parameters:**

- `limit` (integer, default: 20) — Max number of companies to return (min: 1)
- `offset` (integer, default: 0) — Number of companies to skip (min: 0)
- `name` (string, optional) — Filter companies by name (case-insensitive substring match)
- `active` (string, optional) — Filter by active status (`"true"` or `"false"`)
- `employeeName` (string, optional) — Filter companies by employee first or last name (case-insensitive substring match)

**Response:**

```json
{
	"data": [
		{
			"id": 1,
			"name": "Acme Corp",
			"industry": "Manufacturing",
			"active": true,
			"website": "https://acme.com",
			"telephone": "123-456-7890",
			"slogan": "We build things",
			"address": "123 Main St",
			"city": "Metropolis",
			"country": "USA",
			"employees": [
				{
					"id": 101,
					"first_name": "John",
					"last_name": "Doe",
					"email": "john.doe@acme.com",
					"role": "Engineer",
					"company_id": 1
				}
			]
		}
	],
	"pagination": {
		"total": 1,
		"limit": 20,
		"offset": 0
	}
}
```

**Error Responses:**

- `400 Bad Request` — Invalid query parameters

---

#### GET /companies/:id

Returns a single company by ID, including its employees.

**Path Parameters:**

- `id` (integer, required) — Company ID

**Response:**
Same as a single company object above, with an `employees` array.

**Error Responses:**

- `400 Bad Request` — Invalid ID
- `404 Not Found` — Company not found

---

## Notes

- All business logic is in controllers.
- Data loading is handled by services.
- Validation is done with Zod schemas.
