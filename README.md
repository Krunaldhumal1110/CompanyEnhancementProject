# Company Intranet Website

A full-stack intranet web application for workshop dashboard and QC form management.

## Tech Stack
- **Frontend:** React.js (Bootstrap/Material UI)
- **Backend:** Java Spring Boot
- **Database:** MySQL

## Features
- Workshop Dashboard: View ongoing projects/machines
- QC Form: Submit QC data, generate PDF reports

## Deployment & Running Instructions

### 1. Database Setup
- Create MySQL database and tables:
  - Run `db-schema.sql` in your MySQL server.
- Update `backend/src/main/resources/application.properties` with your MySQL username/password.

### 2. Backend (Spring Boot)
- Open a terminal in `backend` folder.
- Build and run:
  - `mvn spring-boot:run`
- The backend will serve the React build from `src/main/resources/static`.

### 3. Frontend (React)
- Open a terminal in `frontend` folder.
- Install dependencies:
  - `npm install`
- Build the React app:
  - `npm run build`
- Copy the build output to backend static folder:
  - Copy everything from `frontend/build/` to `backend/src/main/resources/static/`

### 4. Accessing the App
- Start the backend (`mvn spring-boot:run`).
- App will be available at: `http://<server-ip>:8080`
- Accessible from any device on the same LAN/WiFi.

### 5. PDF Storage
- QC Form PDFs are saved to `C:/company-data/qcforms/` on the server.

### 6. API Endpoints
- `GET /api/projects/ongoing` — Ongoing projects for dashboard
- `POST /api/qc` — Submit QC form
- `GET /api/qc/{id}/pdf` — Download QC form PDF

### 7. Notes
- Ensure MySQL is running and accessible.
- Update firewall to allow port 8080 if needed.
- For development, you can run React and Spring Boot separately (set proxy in React for API calls).

---

For any issues, contact IT support.
