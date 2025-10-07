# Machine Management Backend

This is a Spring Boot backend for managing machines, including CRUD operations, marking machines as complete, and serving static frontend files.

## Features
- REST API for machines (CRUD)
- Endpoint for completed machines
- Mark machine as complete
- Serve static frontend files
- H2 in-memory database (default)

## Getting Started

1. **Build and Run**
   ```sh
   mvn spring-boot:run
   ```

2. **API Endpoints**
   - `GET /api/machines` - List all machines
   - `POST /api/machines` - Add a new machine
   - `POST /api/machines/{id}/complete` - Mark as complete
   - `GET /api/machines/completed` - List completed machines
   - `DELETE /api/machines/{id}` - Delete a machine

3. **H2 Console**
   - Visit `/h2-console` (JDBC URL: `jdbc:h2:mem:testdb`)

4. **Static Frontend**
   - Place frontend build in `src/main/resources/static/`

## Configuration
See `src/main/resources/application.properties` for DB and server settings.

---

Replace H2 with MySQL or other DB as needed in `application.properties`.
