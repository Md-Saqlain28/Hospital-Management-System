# Hospital Management System Backend

This is the Node.js / Express backend for the Hospital Management System, built based on the provided blueprint and tailored for NeonDB (PostgreSQL).

## Prerequisites
- Node.js (v18 or higher recommended)
- A NeonDB (PostgreSQL) database connection string

## Setup Instructions

1. **Install Dependencies**
   Run the following command in this directory:
   ```bash
   npm install
   ```

2. **Database Setup**
   The project uses PostgreSQL (NeonDB). You can find the database schema in `db/schema.sql`.
   - Copy the contents of `db/schema.sql`.
   - Paste and execute it in your NeonDB SQL Editor to create the tables, enums, triggers, and indexes.

3. **Environment Variables**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   DATABASE_URL=your_neon_db_connection_string_here
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   ```
   *Make sure to replace `your_neon_db_connection_string_here` with your actual NeonDB connection URL.*

4. **Start the Server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000` (or the port specified in `.env`).

## Note on Users and Authentication
The schema includes a `Users` table and the `/api/v1/auth/login` endpoint validates against it. To test the API, you will need to manually insert at least one Admin or Receptionist user into the `Users` table via your database client (with a bcrypt-hashed password).

Example for inserting a user (password is `password123` hashed):
```sql
INSERT INTO Users (email, password_hash, role, is_active)
VALUES ('admin@hospital.com', '$2b$10$wT/Yy2M5x1T8Yy2M5x1T8.wT/Yy2M5x1T8Yy2M5x1T8Yy2M5x1T8', 'Admin', true);
```
*(You can generate a valid bcrypt hash using an online tool or a quick node script).*

## Architecture Highlights
- **Framework**: Express.js
- **Database Driver**: `pg` (node-postgres)
- **Validation**: Zod schema validation
- **Security**: JWT for Authentication, Helmet for HTTP headers, CORS, Express-Rate-Limit
- **Routing**: Follows RESTful best practices as defined in the blueprint
