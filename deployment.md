# NestVantage — Deployment Guide

## 1. Project Overview

NestVantage is an AI-assisted real-estate lead management and site-visit booking application.

**Tagline:** Smarter conversations. Better property decisions.

The application consists of:

- Frontend: React with Vite
- Backend: Java 21, Spring Boot
- Database: PostgreSQL
- AI integration: Google Gemini API
- Authentication: JWT

This guide explains how to run the application locally and outlines the configuration changes required for a production deployment.

## 2. Prerequisites

Install the following software:

| Software | Requirement |
|---|---|
| Java | JDK 21 |
| Node.js | Version compatible with the frontend dependencies |
| npm | Installed with Node.js |
| PostgreSQL | Version 18 or compatible |
| Git | For cloning the repository |
| Web browser | Chrome, Edge, or equivalent |

The backend includes a Maven Wrapper, so a separate Maven installation is not required.

## 3. Repository Structure

```text
NestVantage/
├── backend/
│   ├── src/
│   ├── mvnw
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── docs/
├── TDD.md
└── deployment.md
```

## 4. Database Configuration

1. Start PostgreSQL.
2. Open pgAdmin or a PostgreSQL client.
3. Create a database named:

```sql
CREATE DATABASE nestvantage;
```

4. Ensure PostgreSQL is running on port `5432`.
5. The backend connects using the following configuration:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/nestvantage
spring.datasource.username=postgres
```

The database password must be supplied through the `DB_PASSWORD` environment variable.

Hibernate is configured with `spring.jpa.hibernate.ddl-auto=update`, allowing the application to update the database schema when it starts.

## 5. Environment Variables

Configure the following environment variables before starting the backend:

| Variable | Purpose |
|---|---|
| `DB_PASSWORD` | PostgreSQL password |
| `GEMINI_API_KEY` | Google Gemini API key |
| `JWT_SECRET` | Secret used for JWT authentication |
| `DEMO_USER_PASSWORD` | Demo-user password configuration |
| `APP_ADMIN_PASSWORD` | Admin password configuration |

On Windows, these can be configured through:

**Settings → System → About → Advanced system settings → Environment Variables**

Add the variables under User variables or System variables. Use strong, private values for credentials and the JWT secret.

Do not commit actual API keys, passwords, or other secrets to GitHub.

After configuring environment variables, open a new terminal so the updated values are available.

## 6. Backend Setup and Startup

Open PowerShell and navigate to the backend directory:

```powershell
cd "D:\COMPANY INTERVIEW PROCESS\ISOCODE\NestVantage\backend"
```

Load the configured environment variables into the current PowerShell session:

```powershell
$env:DB_PASSWORD = [Environment]::GetEnvironmentVariable("DB_PASSWORD", "User")
$env:GEMINI_API_KEY = [Environment]::GetEnvironmentVariable("GEMINI_API_KEY", "User")
$env:JWT_SECRET = [Environment]::GetEnvironmentVariable("JWT_SECRET", "User")
$env:DEMO_USER_PASSWORD = [Environment]::GetEnvironmentVariable("DEMO_USER_PASSWORD", "User")
$env:APP_ADMIN_PASSWORD = [Environment]::GetEnvironmentVariable("APP_ADMIN_PASSWORD", "User")
```

Start the Spring Boot application:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend should start at:

`http://localhost:8080`

The API base URL is:

`http://localhost:8080/api`

Keep the backend terminal running while using the application.

## 7. Frontend Setup and Startup

Open another terminal and navigate to the frontend directory:

```powershell
cd "D:\COMPANY INTERVIEW PROCESS\ISOCODE\NestVantage\frontend"
```

Install the dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open the application in a browser:

`http://localhost:5173`

The frontend communicates with the backend through:

`http://localhost:8080/api`

## 8. Running Backend Tests

Open a PowerShell terminal in the backend directory.

Load the required environment variables as described in Section 6, then run:

```powershell
.\mvnw.cmd clean test
```

A successful execution should report:

```text
BUILD SUCCESS
```

## 9. Creating a Production Frontend Build

Navigate to the frontend directory:

```powershell
npm run build
```

Vite generates the production build in:

```text
frontend/dist/
```

This directory contains the frontend files that can be served by a production web server.

## 10. Production Deployment Considerations

The current configuration is intended for local development. Before deploying to a public server:

1. Change the frontend API base URL in `frontend/src/api/axiosConfig.js` from the local address to the deployed backend API URL.
2. Configure the backend to use the production database connection details.
3. Update CORS settings to allow the deployed frontend origin.
4. Configure all required environment variables securely on the deployment platform.
5. Use HTTPS for public application traffic.
6. Keep database credentials, Gemini API keys, and JWT secrets outside the source code.
7. Review database schema migration and backup procedures before production use.
8. Disable SQL statement logging in production unless specifically required.
9. Configure appropriate WebSocket access controls before exposing the application publicly.

The current application uses Hibernate schema auto-update. A production deployment should use a controlled database migration strategy.

## 11. External Integrations and Scope

The current implementation includes Gemini-based AI conversations and application-level lead and site-visit management.

External WhatsApp messaging and property-portal integrations are future integration points and should not be considered connected production services.

## 12. Troubleshooting

| Problem | Suggested check |
|---|---|
| Backend fails to start | Verify Java 21 and required environment variables |
| Database connection fails | Check PostgreSQL service, port, database name, username, and password |
| Frontend cannot access APIs | Confirm the backend is running on port 8080 |
| AI responses fail | Verify the Gemini API key and network connectivity |
| Login or authentication fails | Check JWT configuration and the configured account credentials |
| Frontend dependencies fail | Run `npm install` again and inspect the npm error output |
| Backend tests fail | Check database availability and required environment variables |

## 13. Local Application URLs

| Component | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| API base URL | http://localhost:8080/api |
| Public Buyer Chat | http://localhost:5173/buyer-chat |

---

End of Deployment Guide