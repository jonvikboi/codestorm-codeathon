# CampusFlow - Student AI Study Planner Backend

A complete production-ready Node.js and Express backend for managing students, study task, AI-powered study schedules, attendance analysis, and webhook automation.

## Project Overview

This backend provides a full suite of services for the CampusFlow platform, integrating:
- **Supabase** for database management and persistence.
- **Groq API** (`llama-3.3-70b-versatile`) for AI study schedule generation and attendance risk analysis.
- **n8n Webhooks** to trigger automations when new task are created.
- **JWT & bcryptjs** for secure authentication.

## Folder Structure

```
backend/
├── controllers/       # Business logic (Auth, task, AI)
├── middleware/        # JWT auth, Joi validation, error handling, logging
├── routes/            # Express router definitions
├── schemas/           # Joi validation schemas for requests
├── services/          # External integrations (Supabase, Groq, n8n)
├── utils/             # Helper functions (JWT)
├── server.js          # App entry point
├── package.json       # Project dependencies
└── .env.example       # Environment variables template
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to a new file named `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   *Required Variables:*
   - `PORT`: Server port (default 5000)
   - `SUPABASE_URL` & `SUPABASE_KEY`: Find these in your Supabase project settings > API.
   - `JWT_SECRET`: Any secure random string.
   - `GROQ_API_KEY`: Generate from the Groq Cloud Console.
   - `N8N_TASK_WEBHOOK`: Your active n8n webhook URL for Task events (must accept POST requests).
   - `N8N_ATTENDANCE_WEBHOOK`: Your active n8n webhook URL for Attendance events (must accept POST requests).

3. **Supabase Database Setup:**
   Run the following SQL in your Supabase SQL Editor:
   ```sql
   CREATE TABLE students (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name TEXT NOT NULL,
       email TEXT UNIQUE NOT NULL,
       password TEXT NOT NULL,
       phone TEXT,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE task (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       student_id UUID REFERENCES students(id) ON DELETE CASCADE,
       title TEXT NOT NULL,
       description TEXT,
       subject TEXT,
       deadline TIMESTAMPTZ NOT NULL,
       priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')),
       completed BOOLEAN DEFAULT FALSE,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );

   CREATE TABLE Attendance (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       student_id UUID REFERENCES students(id) ON DELETE CASCADE,
       subject TEXT NOT NULL,
       percentage NUMERIC NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

4. **Run the server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

## API Documentation

### Public Routes
- `GET /health` : Server health check.
- `POST /auth/register` : Create a new student account.
- `POST /auth/login` : Authenticate and receive a JWT token.

### Protected Routes (Requires `Authorization: Bearer <token>`)
- `GET /task` : Get all task for the logged-in user, sorted by nearest deadline.
- `GET /task/:id` : Get a specific task.
- `POST /task` : Create a new task (triggers n8n webhook).
- `PUT /task/:id` : Update an existing task.
- `DELETE /task/:id` : Delete a task.
- `POST /ai/study-schedule` : Generate a study schedule.
- `POST /ai/attendance` : Analyze attendance and risk.

## Testing with Postman
1. Start the server.
2. Register a new user at `POST /auth/register`.
3. Login at `POST /auth/login` and copy the `token`.
4. For all other endpoints, go to **Authorization**, select **Bearer Token**, and paste your token.
