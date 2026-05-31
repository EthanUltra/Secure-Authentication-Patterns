## Overview

**Secure Authentication Patterns** is a full-stack authentication project that demonstrates secure user registration, login, session management, refresh-token rotation, account lockout, request validation, and protected routes.

The backend is built with Node.js, Express, Prisma, PostgreSQL, Argon2, JWTs, Zod, Helmet, CORS, cookies, and rate limiting. The frontend is built with React, Vite, Axios, and a context-based authentication store.

This project is designed as a practical reference implementation for common authentication patterns used in modern web applications.

## Problem It Solves

Authentication is one of the most security-sensitive parts of an application. A weak authentication system can expose users to account takeover, password attacks, session theft, token replay, and brute-force login attempts.

This project demonstrates how to build a safer authentication flow by combining multiple defensive layers:

- strong password hashing;
- structured validation;
- short-lived access tokens;
- refresh tokens stored in HTTP-only cookies;
- database-backed refresh-token tracking;
- refresh-token rotation;
- token reuse detection;
- account lockout;
- rate limiting;
- protected API routes.

## Key Features

- User registration with email, name, and password.
- Zod validation for registration and login requests.
- Password hashing with Argon2id.
- Duplicate email prevention.
- Login using email and password.
- JWT access token generation.
- Refresh token generation and storage in PostgreSQL.
- Refresh token sent through an HTTP-only cookie.
- Refresh-token rotation on refresh.
- Revocation of old refresh tokens.
- Reuse detection for revoked refresh tokens.
- Session revocation when refresh-token reuse is detected.
- Logout flow that revokes the active refresh token.
- Account lockout after repeated failed login attempts.
- Login and registration rate limiting.
- Protected `/api/auth/me` endpoint.
- Centralized error handling.
- React authentication context.
- Axios request interceptor for access tokens.
- Axios response interceptor for automatic token refresh after `401` responses.
- Dockerized PostgreSQL, backend, and frontend services.

## Authentication Flow

### Registration

```text
User submits registration form
   ↓
Frontend sends email, name, and password
   ↓
Backend validates request with Zod
   ↓
Backend checks whether the email already exists
   ↓
Password is hashed using Argon2id
   ↓
User record is stored in PostgreSQL
   ↓
Safe user profile is returned without password hash
```

### Login

```text
User submits email and password
   ↓
Backend validates request body
   ↓
Backend looks up user by email
   ↓
Password is verified using Argon2
   ↓
Failed login counter is reset on success
   ↓
Access token is generated
   ↓
Refresh token is generated
   ↓
Refresh token is stored in PostgreSQL
   ↓
Refresh token is sent as an HTTP-only cookie
   ↓
Access token is returned to frontend
```

### Accessing Protected Routes

```text
Frontend stores access token in sessionStorage
   ↓
Axios request interceptor adds Authorization header
   ↓
Backend middleware verifies Bearer token
   ↓
Request continues if token is valid
   ↓
Protected user data is returned
```

### Token Refresh

```text
Access token expires
   ↓
Protected request returns 401
   ↓
Axios response interceptor calls /api/auth/refresh
   ↓
Backend reads refresh token from HTTP-only cookie
   ↓
Backend verifies token and database record
   ↓
Old refresh token is revoked
   ↓
New access token and refresh token are issued
   ↓
Frontend retries original request with the new access token
```

### Logout

```text
User clicks sign out
   ↓
Frontend calls /api/auth/logout
   ↓
Backend revokes active refresh token
   ↓
Backend clears refresh cookie
   ↓
Frontend clears user state and access token
```

## Security Controls

| Control | Implementation | Benefit |
|---|---|---|
| Password hashing | Argon2id through the `argon2` package | Protects stored passwords if the database is exposed. |
| Input validation | Zod schemas | Rejects malformed or weak input before business logic runs. |
| Duplicate account protection | Unique email check | Prevents multiple accounts using the same email address. |
| Generic login errors | `Invalid email or password` | Reduces user enumeration risk during login. |
| Dummy hash verification | Dummy Argon2 verification path for missing users | Helps reduce timing differences between existing and non-existing accounts. |
| Access tokens | JWT bearer tokens | Allows stateless authorization for protected routes. |
| Short access-token expiry | Configurable default such as `15m` | Limits the useful lifetime of stolen access tokens. |
| Refresh tokens | JWT refresh tokens stored in PostgreSQL | Enables session tracking and revocation. |
| HTTP-only cookie | Refresh token cookie is not accessible to JavaScript | Reduces exposure to token theft through XSS. |
| SameSite cookie | `sameSite: strict` | Reduces cross-site request risks. |
| Refresh-token rotation | Old refresh token is revoked during refresh | Limits replay opportunities. |
| Reuse detection | Reusing a revoked refresh token revokes all sessions for that user | Helps detect stolen refresh tokens. |
| Account lockout | Locks account after 5 failed login attempts | Slows brute-force password attacks. |
| Rate limiting | Login and registration endpoints use `express-rate-limit` | Reduces automated abuse. |
| Security headers | Helmet middleware | Adds common HTTP security headers. |
| Centralized errors | Custom errors and error handler | Keeps error responses consistent. |
| Protected route middleware | Bearer token verification | Ensures private data requires authentication. |

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---:|---|
| `GET` | `/api/health` | No | Health check endpoint. |
| `POST` | `/api/auth/register` | No | Creates a new user account. |
| `POST` | `/api/auth/login` | No | Authenticates a user and issues an access token plus refresh cookie. |
| `POST` | `/api/auth/refresh` | Refresh cookie | Rotates refresh token and returns a new access token. |
| `POST` | `/api/auth/logout` | Refresh cookie if available | Revokes the current refresh token and clears the cookie. |
| `GET` | `/api/auth/me` | Yes | Returns the authenticated user's profile. |

### Register Request

```json
{
  "email": "user@example.com",
  "name": "Example User",
  "password": "Password123"
}
```

Password requirements in the backend:

- minimum 8 characters;
- at least one uppercase letter;
- at least one number.

### Login Request

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Successful Login Response

```json
{
  "status": "success",
  "data": {
    "accessToken": "jwt-access-token"
  }
}
```

The refresh token is sent separately as an HTTP-only cookie.

### Authenticated Profile Response

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "Example User",
      "role": "USER",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "failedLogins": 0,
      "isLocked": false
    }
  }
}
```

## Database Schema

The project uses Prisma with PostgreSQL.

### User Model

```text
User
├── id
├── email
├── name
├── passwordHash
├── role
├── isLocked
├── failedLogins
├── lockedUntil
├── createdAt
├── updatedAt
└── refreshTokens
```

Important fields:

- `email` is unique.
- `passwordHash` stores the Argon2id hash, not the plain password.
- `role` supports `USER` and `ADMIN`.
- `failedLogins`, `isLocked`, and `lockedUntil` support account lockout.

### RefreshToken Model

```text
RefreshToken
├── id
├── token
├── userId
├── user
├── isRevoked
├── replacedBy
├── expiresAt
└── createdAt
```

Important fields:

- `token` is unique.
- `userId` links the refresh token to a user.
- `isRevoked` tracks whether the token is still valid.
- `expiresAt` determines token validity.
- Refresh tokens are deleted automatically when the related user is deleted because of cascade behavior.

## Frontend Experience

The React frontend includes:

- login page;
- registration page;
- password strength indicator;
- protected dashboard;
- authenticated profile display;
- token-aware Axios client;
- automatic refresh flow when the backend returns `401`;
- session cleanup on logout;
- simple UI explaining the active security features.

The authentication state is managed through a React context provider in `store/auth.jsx`.

## Project Structure

```text
Secure-Authentication-Patterns-main/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── env.js
│       │   └── prisma.js
│       ├── middleware/
│       │   ├── authenticate.js
│       │   └── errorHandler.js
│       ├── modules/
│       │   └── auth/
│       │       ├── auth.controller.js
│       │       ├── auth.routes.js
│       │       └── auth.service.js
│       └── utils/
│           ├── errors.js
│           └── tokens.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   └── AuthCard.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       └── store/
│           └── auth.jsx
└── docker-compose.yml
```

## Environment Variables

The backend expects environment variables such as:

```env
DATABASE_URL=postgresql://auth_user:auth_pass@postgres:5432/auth_db
PORT=4000
NODE_ENV=development
JWT_ACCESS_SECRET=replace-with-a-strong-access-secret
JWT_REFRESH_SECRET=replace-with-a-strong-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

For production, replace all development secrets with strong random values and store them using a secure secret-management system.

## Running the Project

### With Docker Compose

From the project root:

```bash
cd Secure-Authentication-Patterns-main
docker compose up --build
```

Frontend:

```text
http://localhost:3001
```

Backend API:

```text
http://localhost:4000
```

PostgreSQL runs as a Docker service using the credentials from `docker-compose.yml` and the backend `.env` file.

### Manual Backend Setup

```bash
cd Secure-Authentication-Patterns-main/backend
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

### Manual Frontend Setup

```bash
cd Secure-Authentication-Patterns-main/frontend
npm install
npm run dev
```

## What This Project Demonstrates

This project demonstrates:

- secure password storage;
- Express API design;
- Prisma ORM usage;
- PostgreSQL data modeling;
- JWT-based authentication;
- refresh-token session management;
- secure cookie handling;
- token rotation and revocation;
- login rate limiting;
- account lockout logic;
- React authentication state management;
- protected frontend routes;
- Dockerized full-stack development.

---

# Skills Demonstrated

## Cybersecurity Skills

- Log analysis
- Blue-team detection logic
- Brute-force detection
- Credential-stuffing detection
- Web attack recognition
- Suspicious command detection
- Event correlation
- Alert severity classification
- MITRE ATT&CK mapping
- Authentication security
- Password hashing
- Session management
- Refresh-token security
- Token revocation
- Rate limiting
- Account lockout
- Secure cookie handling

## Backend Development Skills

- Flask API development
- Express API development
- REST endpoint design
- Request validation
- Middleware design
- Error handling
- File upload handling
- Dataclass modeling in Python
- Prisma schema design
- PostgreSQL integration
- JWT signing and verification
- Environment-based configuration

## Frontend Development Skills

- React component architecture
- React Context state management
- Axios API integration
- Request and response interceptors
- File upload UI
- Dashboard UI design
- Conditional rendering
- Authentication-aware frontend flows
- Protected dashboard rendering
- Responsive application layout

## DevOps and Tooling Skills

- Dockerfile usage
- Docker Compose orchestration
- Multi-service local development
- PostgreSQL container setup
- Backend/frontend service separation
- Environment-variable configuration

---

# Portfolio Summary

These two projects work well together as a cybersecurity and application-development portfolio.

**Blue Team Log Analysis Lab** shows defensive security capability. It demonstrates that the developer can parse logs, detect suspicious patterns, generate useful alerts, and present findings in a clear dashboard.

**Secure Authentication Patterns** shows secure application-development capability. It demonstrates that the developer understands how authentication systems should handle passwords, tokens, sessions, cookies, validation, rate limiting, and account lockout.

Together, they are relevant for roles such as:

- Junior Application Developer
- Full-Stack Developer Intern
- Backend Developer Intern
- Cybersecurity Intern
- SOC Analyst Intern
- Blue Team Intern
- Security-Focused Web Developer
- Application Security Intern

---

# Future Improvements

## Blue Team Log Analysis Lab

Potential improvements:

- Add CSV and JSON export for alerts.
- Add alert filtering by severity, source IP, user, tactic, and technique.
- Add timeline visualization.
- Add support for more real-world log formats such as Syslog, Apache, Nginx, Windows Event Logs, and JSON logs.
- Add Sigma-rule style detection definitions.
- Add unit tests for parsers and detectors.
- Add persistent storage for previous analyses.
- Add authentication for dashboard access.
- Add report generation for incident summaries.
- Add confidence scores and false-positive notes.

## Secure Authentication Patterns

Potential improvements:

- Store hashed refresh tokens instead of raw refresh tokens.
- Add email verification.
- Add password reset flow.
- Add multi-factor authentication.
- Add device/session management page.
- Add audit logging for login, logout, refresh, and failed attempts.
- Add CSRF protection for cookie-based refresh routes.
- Add stricter production CORS configuration.
- Add role-based authorization examples.
- Add automated tests for authentication flows.
- Add deployment configuration for a production environment.

---

# Notes

These projects are intended for educational and portfolio use. Before using either project in production, review and harden the following areas:

- secret management;
- HTTPS and secure cookie behavior;
- CORS configuration;
- database migrations;
- logging and monitoring;
- input size limits;
- error disclosure;
- test coverage;
- production deployment settings;
- dependency updates;
- threat modeling.

