# Tekkit Sample API

This is an example API to show the use of typeorm with REST, etc.

## Setup

### Environment

| Key | Description | Sample |
| - | - | - |
| PORT | Defaults to 80. The port to run on. | 8080 |
| POSTGRES_URL | URL connection string to a Postgres database. | n/a |

### Docker Setup

Requirements:
  - Docker

Run Docker Tests
```sh
docker compose run --rm tests
```

Run Docker API
```sh
docker compose up --build api
```

### Local Setup

Requirements:
  - Docker
  - Node > 18

Setup Postgres
```sh
docker compose up -d postgres
```

Sample `.env` file
```sh
POSTGRES_URL=postgres://accounts:accounts-password@localhost:5432/accounts_db?sslmode=disable
```

Run Local Tests
```sh
npm test
```

Run Local API
```sh
npm start
```

### REST Routes

Authorization: Currently, any string in the `Authorization` will work and act as the user identifier.

Sample Authorization: `bob`

Note:
> Authorization is used to limit which accounts may be viewed.

| Method | Route | Query Params | Body |
| - | - | - | - |
| POST | /api/v1/accounts | n/a | [AccountInput](#AccountInput) |
| GET | /api/v1/accounts | [AccountQueryParams](#AccountQueryParams) | n/a |

## AccountInput

Sample
```
{ 
  "email": "bob@gmail.com"
}
```

## AccountQueryParams

Sample
```
?limit=1
```

| Param | Type | Sample | Description |
| - | - | - | - |
| limit | number | `?limit=32` | Limits the number of records in the response. |
| createdBefore | datetime | `?createdBefore=2023-12-06T20:55:56.948Z` | Filters records which were created before the specified datetime. |
| total | boolean | `?total` | Calculates the total count of the records within the query. Ignores limit. Defaults to true if param key is present, even if empty. |