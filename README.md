# MarkTrack – Monthly Test & Marks Management System

A full-stack MERN application for managing students, subjects, monthly tests, and marks, with separate Teacher and Student roles.

## Project Structure

```
MarkTrack/
├── backend/    # Node.js + Express + MongoDB (Mongoose) API
└── frontend/   # React + Vite client
```

## Getting Started

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your MongoDB Atlas connection string + a JWT secret
npm install
npm run dev      # or: npm start
```

The API will run on `http://localhost:5000` (or the `PORT` you set).

Verify it's running:
```bash
curl http://localhost:5000/api/health
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app will run on `http://localhost:5173`.

### 3. Create Your First Accounts

There is no seed data. Register your first teacher and student accounts directly against the API, e.g.:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Teacher","email":"teacher@example.com","password":"password123","role":"teacher"}'

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Student","email":"student@example.com","password":"password123","role":"student"}'
```

Then log in through the app UI at `/login`.

**Important:** for a student's dashboard/marks/performance pages to show data, a **Student record** (created by a teacher under `/teacher/students`) must have the **same email** as that student's login account. This is how the app links a logged-in student user to their academic record.

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs (CommonJS)
- **Frontend:** React, Vite, React Router, Axios, Lucide React

## API Overview

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET/POST/PUT/DELETE | `/api/students` | GET: any role · Write: teacher only |
| GET/POST/PUT/DELETE | `/api/subjects` | GET: any role · Write: teacher only |
| GET/POST/PUT/DELETE | `/api/tests` | GET: any role · Write: teacher only |
| GET/POST/PUT/DELETE | `/api/marks` | GET: any role · Write: teacher only |
| GET | `/api/marks/student/:studentId/performance` | Authenticated |
| GET | `/api/health` | Public |

All responses follow: `{ success, message, data }`.

## Security Notes

- Passwords are hashed with bcryptjs and never returned in API responses.
- JWT secret and MongoDB URI are never hardcoded — configure them in `backend/.env`.
- The frontend only talks to MongoDB through the Express API; it never connects directly to the database.
