# Tekkit Sample API

This is an example API to show the use of typeorm with REST, etc.

## Setup

### Environment

| Key | Description | Sample |
| - | - | - |
| PORT | The port to run on. | 8080 |
| POSTGRES_URL | URL connection string to a Postgres database. | n/a |

### Docker Setup

Requirements:
  - Docker

Run Tests
```sh
docker compose run --rm tests
```

Run API
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

Run API
```sh
npm start
```
