# NestVantage
### Smarter conversations. Better property decisions.

**An AI-powered real estate lead management and site visit booking assistant.**

NestVantage is a real estate intelligence platform designed to help property developers manage incoming leads, respond to buyer enquiries, schedule site visits, and improve sales team coordination through AI-powered conversations and centralized lead management.

---

## Project Overview

Real estate developers often receive thousands of enquiries through property portals, social media, advertisements, and other channels. Delayed responses, missed follow-ups, and inefficient site visit coordination can result in lost sales opportunities.

NestVantage addresses these challenges through a centralized platform that combines lead management, AI-powered buyer assistance, site visit scheduling, analytics, and human sales handoff.

## Key Features

### 1. Lead Management
- Create, view, update, and delete leads.
- Track lead details, contact information, project interest, and lead sources.
- Detect duplicate leads using phone number validation.
- Monitor lead statuses and booking progress.

### 2. AI Conversations
- AI-powered property enquiry assistant using Google Gemini.
- Supports English, Hindi, and Gujarati conversations.
- Maintains conversation context for follow-up questions.
- Uses verified property fact sheet information to answer buyer enquiries.
- Stores conversation history in PostgreSQL.

### 3. Site Visit Management
- Schedule property site visits for interested buyers.
- Select projects, dates, and available time slots.
- Prevent duplicate bookings for the same project, date, and time.
- Cancel bookings and release the corresponding slot.
- Track booking statuses: Booked, Completed, Cancelled, and No Show.

### 4. Human Handoff
- Transfer buyer conversations to sales executives.
- Assign and manage handoff requests.
- Support handoff acceptance and resolution.
- View conversation history and summaries.
- Receive real-time handoff notifications through WebSockets.

### 5. Property Fact Sheet Management
- Create and maintain structured property information.
- Update project configurations, descriptions, and pricing information.
- Activate or deactivate property fact sheets.
- Provide verified property information to the AI assistant.

### 6. Dashboard and Analytics
- Monitor lead and site visit statistics.
- Track booking outcomes.
- View lead conversion and site visit performance.
- Analyze sales activity through centralized metrics.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| UI | CSS, Lucide React |
| Backend | Java 21, Spring Boot |
| API | REST APIs |
| Database | PostgreSQL |
| ORM | Spring Data JPA, Hibernate |
| AI Integration | Google Gemini API |
| Real-time Communication | WebSocket, STOMP |
| Build Tool | Maven |
| Version Control | Git, GitHub |

---

## System Architecture

NestVantage follows a frontend-backend architecture.

```text
          User
           |
           v
    React.js Frontend
           |
           | REST API
           v
    Spring Boot Backend
       /      |       \
      /       |        \
     v        v         v
 PostgreSQL  Gemini API  WebSocket
 Database    AI Service  Notifications
```

- **Frontend:** Provides the dashboard and interactive management interfaces.
- **Backend:** Handles business logic, API requests, validation, and data processing.
- **Database:** Stores leads, site visits, conversations, handoffs, and property information.
- **AI Service:** Processes buyer enquiries using Google Gemini and verified property data.
- **WebSocket:** Supports real-time handoff notifications.

---

## Project Structure

```text
NestVantage/
│
├── backend/
│   ├── src/main/java/
│   │   └── NestVantage/API/
│   │       ├── config/
│   │       ├── controller/
│   │       ├── dto/
│   │       ├── entity/
│   │       ├── repository/
│   │       ├── service/
│   │       └── service/ai/
│   │
│   ├── src/main/resources/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Getting Started

### Prerequisites

Install the following:

- Java 21 or later
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/SamBenjaminR/NestVantage.git
cd NestVantage
```

### 2. Database Configuration

Create a PostgreSQL database:

```sql
CREATE DATABASE nestvantage;
```

Configure the database connection in:

`backend/src/main/resources/application.properties`

Set the appropriate PostgreSQL username, password, and connection URL for your local environment.

The application also requires the Gemini API key to be supplied through the `GEMINI_API_KEY` environment variable.

Never commit API keys, passwords, or other credentials.

### 3. Start the Backend

Open a terminal:

```bash
cd backend
```

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

The Spring Boot application uses port `8080` by default.

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local development URL displayed by Vite in your browser.

---

## API Overview

The backend exposes REST API endpoints for the following modules:

| Module | Base Endpoint |
|---|---|
| Leads | `/api/leads` |
| Site Visits | `/api/site-visits` |
| Booking Slots | `/api/booking-slots` |
| AI Conversations | `/api/ai-chat` |
| Human Handoffs | `/api/handoffs` |
| Property Fact Sheets | `/api/property-fact-sheets` |

The endpoints support the operations implemented by their respective controllers.

---

## Testing and Validation

The project has undergone backend and frontend build verification.

- Backend: Maven test execution.
- Frontend: Vite production build.
- Functional verification of lead management and duplicate detection.
- Site visit booking, cancellation, and status updates.
- AI conversation and contextual follow-up testing.
- Property fact sheet management.
- Human handoff and real-time notification testing.

---

## Project Scope

NestVantage is developed as a software engineering take-home project.

The current implementation focuses on core application workflows, backend services, database persistence, AI integration, and sales team coordination.

External property portal integrations, production authentication, and deployment-specific configurations are outside the currently verified implementation scope.

---

## Author

**Sam Benjamin R**

B.E. Electronics and Communication Engineering — 2026

- GitHub: [SamBenjaminR](https://github.com/SamBenjaminR)
- LinkedIn: [Sam Benjamin R](https://www.linkedin.com/in/samben24/)
- Portfolio: [Personal Portfolio](https://sambenjaminr.github.io/portfolio/)

---

## Copyright

Copyright © 2026 Sam Benjamin R. All rights reserved.

NestVantage is an original project developed as part of a software engineering selection process.

No permission is granted for unauthorized copying, redistribution, or commercial use of this work, subject to any applicable assignment terms or agreements.
