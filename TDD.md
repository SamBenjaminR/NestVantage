# NestVantage – Technical Design Document

**Product:** NestVantage  
**Tagline:** Smarter conversations. Better property decisions.  
**Domain:** Real Estate Intelligence  
**Version:** 1.0  
**Date:** November 2026  
**Organization:** Company A, Ahmedabad

---

## 1. Project Overview

NestVantage is an AI-assisted real estate lead management and site-visit booking platform designed for property developers.

The system helps sales teams manage enquiries from multiple sources, respond to prospective buyers, qualify their requirements, schedule property visits, and monitor sales performance.

The application provides a centralized dashboard for administrators and sales teams, along with a public buyer-facing chat and booking interface.

### 1.1 Problem Statement

The property developer receives approximately 3,000 enquiries per month through advertising campaigns and property portals.

The existing lead-handling process faces several challenges:

- Delayed responses to prospective buyers.
- Leads that remain uncontacted.
- Duplicate enquiries from different sources.
- Manual coordination of site visits.
- Limited visibility into sales-team performance.
- Difficulty measuring marketing expenditure against completed visits.

### 1.2 Proposed Solution

NestVantage addresses these challenges through:

- Centralized lead management.
- AI-assisted buyer conversations.
- Buyer requirement qualification.
- Automated lead creation and duplicate detection.
- Site-visit booking with available time slots.
- Human handoff to sales executives.
- Role-based access control.
- Dashboard analytics and marketing-spend tracking.
- Site-visit reminder processing and notifications.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Routing | React Router |
| HTTP communication | Axios |
| Backend | Java 21, Spring Boot 4 |
| Backend security | Spring Security, JWT |
| Database | PostgreSQL 18 |
| ORM | Spring Data JPA, Hibernate |
| AI integration | Google Gemini API |
| Real-time communication | WebSocket, STOMP |
| Build management | Maven Wrapper |
| Version control | Git and GitHub |

---

## 3. System Architecture

NestVantage follows a client-server architecture.

The React frontend communicates with the Spring Boot backend through REST APIs. The backend handles authentication, business logic, database operations, and AI integration.

PostgreSQL stores application data. Google Gemini provides AI-generated buyer responses using the available property fact sheets as context.

WebSocket communication supports real-time staff notifications.

### 3.1 Architecture Overview

```text
                 BUYER / SALES TEAM
                         |
              +----------+----------+
              |                     |
        Public Buyer Chat      Staff Dashboard
              |                     |
              +----------+----------+
                         |
                  React Frontend
                    (Vite)
                         |
                    Axios / REST
                         |
                 Spring Boot Backend
                         |
       +-----------------+-----------------+
       |                 |                 |
 Authentication     Business Logic      AI Service
   (JWT/RBAC)        and Services       (Gemini API)
       |                 |                 |
       +-----------------+-----------------+
                         |
                    PostgreSQL
                         |
                 Application Data

       Spring Boot Backend
                |
          WebSocket / STOMP
                |
        Real-time Notifications
```

### 3.2 Frontend Architecture

The frontend is organized into reusable components, layouts, pages, contexts, and service modules.

Main areas include:

- `components/` – Reusable UI components such as the sidebar.
- `layouts/` – Shared dashboard layout.
- `pages/` – Dashboard, Leads, Site Visits, Analytics, Handoffs, and other screens.
- `services/` – API communication modules.
- `context/` – Authentication and theme state management.
- `api/` – Axios configuration.

The application provides separate public and authenticated staff routes.

### 3.3 Backend Architecture

The backend follows a layered architecture:

- **Controller layer:** Receives HTTP requests and returns responses.
- **Service layer:** Implements business rules and application workflows.
- **Repository layer:** Performs database operations using Spring Data JPA.
- **Entity layer:** Represents persistent database objects.
- **Security layer:** Handles authentication, authorization, and role restrictions.
- **AI service layer:** Integrates with Google Gemini.

This separation improves maintainability and makes individual features easier to test.

---

## 4. User Roles and Access Control

NestVantage supports three staff roles.

| Role | Permissions |
|---|---|
| ADMIN | Full administrative access |
| SALES_HEAD | Sales management, analytics, marketing spend, booking-slot management, and team oversight |
| SALES_EXECUTIVE | Assigned leads, conversations, site visits, and handoffs |

### 4.1 Authentication

Staff authenticate using their registered email address and password.

On successful login:

1. The backend validates the credentials.
2. A JWT token is returned.
3. The frontend stores the token and authenticated user information.
4. Protected API requests use the authentication token.
5. The backend verifies the user's identity and permissions.

### 4.2 Authorization

Role-based authorization is implemented using Spring Security and method-level security.

Sensitive operations are restricted on the backend rather than relying only on frontend navigation visibility.

Conversation access is also checked against ownership and assigned-executive permissions.

The public buyer chat and booking interface does not require staff authentication.

---

## 5. Core Functional Modules

### 5.1 Dashboard

The dashboard provides an overview of lead and site-visit activity.

Key information includes:

- Total leads.
- Site visits.
- Average response time.
- Visit conversion.
- Recent leads.
- Lead status and source information.

Dashboard metrics are retrieved from backend APIs.

### 5.2 Lead Management

The Leads module provides centralized enquiry management.

Features include:

- Viewing lead records.
- Tracking lead sources.
- Viewing buyer and project information.
- Tracking lead status.
- Identifying duplicate phone numbers.
- Creating and managing lead records.
- Restricting deletion based on user roles.

Lead sources can include property portals, social media, websites, and other enquiry channels.

### 5.3 AI Conversations

The AI Conversations module supports buyer enquiries through an AI-assisted chat interface.

The AI integration uses Google Gemini.

Key capabilities:

- Responding to property-related questions.
- Understanding buyer requirements.
- Collecting budget and configuration preferences.
- Supporting English, Hindi, and Gujarati conversations.
- Maintaining conversation context.
- Using active property fact sheets to ground responses.
- Escalating conversations to human sales staff when required.

The AI is instructed not to invent property information when verified information is unavailable.

### 5.4 Public Buyer Chat

The buyer-facing chat is available through the public `/buyer-chat` route.

Buyers can interact without creating a staff account.

The public flow supports:

- Enquiry conversations.
- Collection of buyer details.
- Project selection.
- Requirement qualification.
- Site-visit booking.
- Human assistance requests.

The public booking workflow creates or associates a lead and records the site visit.

### 5.5 Site-Visit Management

The Site Visit Management module allows staff to view and manage bookings created through the buyer-facing workflow.

Features include:

- Viewing all site visits.
- Viewing buyer and project details.
- Tracking visit dates and times.
- Viewing booking identifiers.
- Cancelling bookings.
- Updating visit status.

Supported statuses:

- Booked
- Cancelled
- Completed
- No Show

The staff management page is separate from the public buyer booking interface.

### 5.6 Booking-Slot Management

Administrators and Sales Heads can manage available site-visit slots.

Features include:

- Creating slots.
- Editing slots.
- Activating and deactivating slots.
- Deleting slots.
- Organizing slots by project.

The backend validates booking availability and prevents duplicate active bookings for the same project, date, and time.

A database-level partial unique index provides additional protection against concurrent duplicate bookings.

### 5.7 Human Handoffs

The handoff module transfers conversations requiring human assistance to sales executives.

Features include:

- Creating a handoff request.
- Assigning a sales executive.
- Viewing handoff details.
- Accepting requests.
- Resolving requests.
- Viewing conversation history.
- Sending real-time staff notifications.

Sales executives have access to their assigned handoffs, while managers can oversee team handoffs.

### 5.8 Property Fact Sheets

Property Fact Sheets allow authorized staff to maintain property information used by the AI assistant.

The module supports:

- Creating fact sheets.
- Editing property information.
- Activating and deactivating fact sheets.
- Maintaining information for multiple projects.

Only active fact sheets are used as property context by the AI service.

### 5.9 Analytics

The Analytics module provides information to administrators and Sales Heads.

Metrics include:

- Lead response time.
- Site-visit statistics.
- Visit conversion.
- Show-up rate.
- Cost per completed visit by lead source.

### 5.10 Marketing Spend Management

The Marketing Spend module records monthly marketing expenditure by lead source.

Authorized users can:

- Add marketing expenditure.
- Edit expenditure records.
- View expenditure by month.
- Delete expenditure records.

The cost-per-completed-visit calculation is:

**Cost per Completed Visit = Monthly Marketing Spend / Completed Site Visits**

The calculation is grouped by lead source.

When expenditure data or completed-visit data is unavailable, the analytics interface displays N/A instead of presenting an incorrect cost.

---

## 6. Database Design

PostgreSQL is used as the primary relational database.

Spring Data JPA and Hibernate manage entity persistence and database operations.

The database contains logical entities for:

| Entity | Purpose |
|---|---|
| App Users | Staff accounts, roles, and authentication |
| Sales Executives | Sales-team information |
| Leads | Buyer enquiries and lead details |
| Conversations | Buyer conversation records and ownership |
| Messages | Conversation messages |
| Site Visits | Booking and visit information |
| Booking Slots | Configured visit time slots |
| Property Fact Sheets | Verified property information |
| Handoffs | Human-assistance requests and assignments |
| Marketing Spends | Monthly marketing expenditure |

### 6.1 Data Integrity

The application uses:

- Primary keys.
- Foreign-key relationships.
- Unique constraints.
- Validation rules.
- Database-level booking protection.
- Transactional service operations where required.

### 6.2 Site-Visit Booking Protection

An active booking must not conflict with another booking for the same project, date, and time.

A partial unique index enforces this condition for records whose status is `Booked`.

Cancelled bookings release the slot for future bookings.

---

## 7. API Design

The backend exposes REST endpoints under `/api`.

The following are the main implemented API areas.

| API path | Purpose |
|---|---|
| `/api/auth` | Staff authentication |
| `/api/leads` | Lead management |
| `/api/analytics` | Dashboard and analytics |
| `/api/booking-slots` | Booking-slot management |
| `/api/marketing-spends` | Marketing expenditure |
| `/api/analytics/cost-per-visit` | Cost-per-completed-visit analytics |
| `/api/` conversation endpoints | AI conversation operations |
| `/api/` handoff endpoints | Human handoff operations |
| `/api/` site-visit endpoints | Site-visit management |

### 7.1 Booking-Slot APIs

- `GET /api/booking-slots/active`
- `GET /api/booking-slots/project/{projectName}`
- `GET /api/booking-slots`
- `POST /api/booking-slots`
- `PUT /api/booking-slots/{id}`
- `DELETE /api/booking-slots/{id}`

Administrative slot-management operations are restricted to ADMIN and SALES_HEAD.

### 7.2 Analytics APIs

- `GET /api/analytics/response-time`
- `GET /api/analytics/cost-per-visit?month=YYYY-MM`

Analytics endpoints are restricted to ADMIN and SALES_HEAD.

### 7.3 Marketing Spend APIs

- `GET /api/marketing-spends`
- `GET /api/marketing-spends/month/{month}`
- `POST /api/marketing-spends`
- `PUT /api/marketing-spends/{id}`
- `DELETE /api/marketing-spends/{id}`

---

## 8. AI Integration Design

Google Gemini is integrated through the backend AI service.

The frontend does not directly expose the Gemini API key.

### 8.1 AI Conversation Flow

1. A buyer submits a message through the public chat.
2. The frontend sends the message to the backend.
3. The backend identifies or creates the conversation.
4. Conversation ownership and access are validated.
5. The AI service retrieves relevant active property fact-sheet information.
6. The Gemini API generates a response using the conversation context and available property information.
7. The response is returned to the frontend.
8. Conversation messages are persisted.

### 8.2 Grounded Responses

The AI assistant uses active property fact sheets as its source of property information.

When specific details are unavailable, the assistant is instructed to avoid inventing facts and guide the buyer toward confirmation from the sales team.

---

## 9. Real-Time Communication and Notifications

WebSocket communication is used for real-time staff notifications.

The application supports notifications associated with human handoffs and site-visit reminders.

Site-visit records also maintain reminder-processing flags for 24-hour and 2-hour reminders.

External WhatsApp integration is not part of the currently verified implementation.

---

## 10. Security Considerations

The application incorporates the following security measures:

- JWT-based staff authentication.
- Role-based authorization.
- Backend permission checks.
- Conversation ownership validation.
- Restricted administrative operations.
- Environment-variable-based secret configuration.
- Database constraints for important data-integrity rules.
- Backend-mediated AI API requests.

Sensitive configuration values such as database credentials, JWT secrets, and Gemini API keys are supplied through environment variables rather than committed as source-code secrets.

---

## 11. Testing and Validation

Testing includes backend build verification, frontend production compilation, and manual functional testing.

### 11.1 Build Verification

| Test | Result |
|---|---|
| Frontend `npm run build` | Successful |
| Backend `.\mvnw.cmd clean test` | Successful |
| Backend test failures | 0 |
| Backend test errors | 0 |
| PostgreSQL connection during test | Successful |

### 11.2 Functional Validation

The following workflows have been manually exercised:

- Staff login for different roles.
- Role-based page visibility and route restrictions.
- Lead listing and duplicate detection.
- Public buyer site-visit booking.
- Booking-slot availability validation.
- Duplicate booking prevention.
- Cancellation and slot release.
- Site-visit status management.
- AI conversation flow.
- Property fact-sheet-based AI responses.
- Human handoff assignment and management.
- Marketing spend creation, editing, and deletion.
- Cost-per-completed-visit analytics.
- Staff notification flows.

The backend currently has a successful Spring Boot application-context test. Manual functional checks supplement this automated test coverage.

---

## 12. Deployment Architecture and Configuration

The application requires:

- Java 21.
- PostgreSQL 18 or a compatible PostgreSQL version.
- Node.js and npm.
- A valid Google Gemini API key for AI functionality.

The frontend and backend are developed as separate applications.

Configuration values are supplied using environment variables.

Detailed setup, environment configuration, database preparation, and execution instructions are documented separately in `deployment.md`.

---

## 13. Known Limitations and Future Enhancements

The following are potential improvements beyond the currently verified implementation:

1. WhatsApp Business API integration.
2. Direct integrations with external property portals.
3. Stronger authentication for WebSocket/STOMP subscriptions.
4. Expanded automated unit, integration, and security testing.
5. Production deployment and monitoring.
6. Advanced reporting and conversion forecasting.
7. Improved mobile navigation and responsive refinements.
8. More comprehensive AI evaluation and fallback handling.

---

## 14. Conclusion

NestVantage provides an integrated platform for real estate lead management, AI-assisted buyer engagement, site-visit coordination, sales handoffs, and marketing analytics.

The architecture separates frontend presentation, backend business logic, AI integration, and persistent storage.

The implementation focuses on data integrity, role-based access, buyer convenience, and sales-team visibility.

NestVantage – Smarter conversations. Better property decisions.