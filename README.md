# Microservices Architecture with Spring Cloud — Billing

Practical activity: an invoicing (facturation) system split into Spring Boot microservices, wired together with Spring Cloud (Config, Eureka, Gateway, OpenFeign) and consumed by an Angular client.

**Stack:** Java 21, Spring Boot 3.5, Spring Cloud 2025.0, Spring Data JPA / REST, H2 (in-memory), Maven (wrapper included), Angular 22.

## Architecture

```
Angular (4200) ──> gateway-service (8888) ──> customer-service  (8081)
                         │                ├─> inventory-service (8082)
                         │                └─> billing-service   (8083) ──Feign──> customer + inventory
                         └─ discovery via Eureka (8761)
        config-service (9999) serves config-repo/ to every service
```

| Module | Port | Role |
|---|---|---|
| `config-service` | 9999 | Spring Cloud Config server, reads `config-repo/` |
| `discovery-service` | 8761 | Eureka server |
| `customer-service` | 8081 | Customers (Spring Data REST, HAL) |
| `inventory-service` | 8082 | Products (Spring Data REST, HAL) |
| `billing-service` | 8083 | Bills; calls customer and inventory services with OpenFeign |
| `gateway-service` | 8888 | Spring Cloud Gateway (dynamic routes, static profile available), CORS for Angular |
| `ecom-web-app` | 4200 | Angular client |

Centralised configuration lives in [`config-repo/`](config-repo): shared Eureka/actuator settings, one H2 database per service, Feign timeouts, and the gateway CORS rules (`FRONTEND_ORIGIN`, default `http://localhost:4200`).

## Prerequisites

- JDK 21
- Node.js and npm (frontend only)
- No Maven install needed: use `./mvnw` (`mvnw.cmd` on Windows)

## Run

1. Build everything from this folder:
   ```
   ./mvnw clean verify
   ```
2. Start the backend. The script launches the services in the right order (config, discovery, then the rest) and waits for each `/actuator/health`:
   ```powershell
   ./scripts/start-backend.ps1                 # dynamic routes (Eureka discovery locator)
   ./scripts/start-backend.ps1 -StaticRoutes   # gateway with the "static" profile
   ```
   Logs go to `target/local-logs/`. Ctrl+C stops every service.
3. Start the frontend:
   ```
   cd ecom-web-app
   npm install
   npm start
   ```
   Open http://localhost:4200.

To start a service by hand: `java -jar <service>/target/<service>-1.0.0.jar`, always **config-service** and **discovery-service** first.

## Main endpoints

Through the gateway (`http://localhost:8888/{service-id}/...`):

| Endpoint | Description |
|---|---|
| `GET /customer-service/customers`, `/customers/{id}` | Customers |
| `GET /inventory-service/products`, `/products/{id}` | Products |
| `GET /billing-service/bills` | All bills |
| `GET /billing-service/fullBill/{id}` | One bill with its customer and products resolved through Feign |
| `POST /billing-service/bills` | Create a bill |
| `GET /billing-service/billing-config` | Value of `billing.message`, reloadable via `/actuator/refresh` |

Other URLs: Eureka dashboard http://localhost:8761 · health `http://localhost:{port}/actuator/health`.

## Project layout

```
config-repo/        centralised configuration served by config-service
config-service/     Spring Cloud Config server
discovery-service/  Eureka server
customer-service/   customers API
inventory-service/  products API
billing-service/    bills API + Feign clients
gateway-service/    API gateway (application.yml + application-static.yml)
ecom-web-app/       Angular client
scripts/            start-backend.ps1
```
