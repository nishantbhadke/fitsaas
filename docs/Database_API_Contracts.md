# Database Schema & API Contract Specification

This document provides a highly detailed map of the FitSaaS database schema, system entity relations, and the REST API endpoints that power the application.

---

## 1. Database Entity-Relationship (ER) Model

The FitSaaS data persistence layer is managed using **Prisma ORM** over **Neon Serverless PostgreSQL**. The following Mermaid diagram maps the database tables, field data types, constraints, and cascade delete rules:

```mermaid
erDiagram
    USER {
        String id PK "UUID (default)"
        String email UK "Unique address"
        String password "Hashed credentials"
        String name "Nullable"
        String image "OAuth profile pic"
        Gender gender "MALE | FEMALE | OTHER | ..."
        Int cycleLength "Default: 28"
        DateTime lastPeriodStart "Nullable"
        Float weight "In kg"
        Float height "In cm"
        Float targetWeight "In kg"
        DateTime birthDate "Nullable"
        ActivityLevel activityLevel "Default: MODERATELY_ACTIVE"
        Int dailyWaterGoal "Default: 2000ml"
        Int dailyCalorieGoal "Default: 2000kcal"
        Boolean dietPlanEnabled "Default: false"
        DietType dietType "Default: NON_VEGETARIAN"
        Boolean isLactoseIntolerant "Default: false"
        Boolean isGlutenFree "Default: false"
        Boolean menstrualTrackingEnabled "Default: false"
        DateTime createdAt "Default: now()"
        DateTime updatedAt "Auto-updated"
    }

    WORKOUT {
        String id PK "UUID"
        String title "Routine name"
        DateTime date "Default: now()"
        Int duration "Duration in minutes"
        String notes "Exercise logs / details"
        String userId FK "Cascade delete on User"
        DateTime createdAt "Default: now()"
        DateTime updatedAt "Auto-updated"
    }

    EXERCISE {
        String id PK "UUID"
        String name "Movement name"
        String workoutId FK "Cascade delete on Workout"
        DateTime createdAt "Default: now()"
        DateTime updatedAt "Auto-updated"
    }

    SET {
        String id PK "UUID"
        Int reps "Count"
        Float weight "Weight in kg"
        String exerciseId FK "Cascade delete on Exercise"
        DateTime createdAt "Default: now()"
        DateTime updatedAt "Auto-updated"
    }

    MENSTRUAL_LOG {
        String id PK "UUID"
        String userId FK "Index / Cascade delete on User"
        DateTime startDate "Logged cycle start"
        DateTime endDate "Nullable cycle end"
        String symptoms "List: cramps, fatigue, etc."
        String mood "Happy, calm, irritable, fatigued"
        Int energy "Scale 1-5"
        String notes "Symptom journal notes"
        DateTime createdAt "Default: now()"
        DateTime updatedAt "Auto-updated"
    }

    USER ||--o{ WORKOUT : "creates"
    USER ||--o{ MENSTRUAL_LOG : "logs"
    WORKOUT ||--|{ EXERCISE : "contains"
    EXERCISE ||--|{ SET : "includes"
```

---

## 2. Enums and Global Data Structures

### `DietType`
Defines the dietary restriction boundaries utilized by the Indian protein customizer engine:
- `NON_VEGETARIAN`: Includes poultry, fish, eggs, and dairy.
- `VEGETARIAN`: Excludes poultry and meat; includes eggs and dairy.
- `VEGAN`: Excludes all animal-derived foods (dairy, honey, eggs, meat).

### `ActivityLevel`
Determines metabolic multipliers for daily energy expenditure estimations:
- `SEDENTARY`: Desk job, minimal structured physical exertion.
- `LIGHTLY_ACTIVE`: 1–3 light training sessions per week.
- `MODERATELY_ACTIVE`: 3–5 moderate workouts per week (Application Default).
- `VERY_ACTIVE`: 6+ high-intensity training sessions per week.

### `Gender`
Guides customized cardiorespiratory advice and cycle-mapping rules:
- `MALE` | `FEMALE` | `OTHER` | `PREFER_NOT_TO_SAY`

---

## 3. REST API Contract Specifications

All service endpoints utilize JSON for payload delivery. Authenticated routes require an `Authorization: Bearer <JWT>` header.

### 🔑 Authentication & Profile Endpoints

#### 1. `POST /auth/register`
Creates a brand new user profile within the PostgreSQL database.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "Jane Doe"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "e4b6c318-72e9-4e78-bc5a-8b17b6a19f02",
      "email": "user@example.com",
      "name": "Jane Doe"
    }
  }
  ```

#### 2. `POST /auth/login`
Validates standard email/password credentials and issues a secure JWT token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "e4b6c318-72e9-4e78-bc5a-8b17b6a19f02",
      "email": "user@example.com",
      "name": "Jane Doe"
    }
  }
  ```

#### 3. `POST /auth/google`
Authenticates a user via Google Sign-In, dynamically registers them if they don't exist, and returns a verified symmetric token.
- **Request Body**:
  ```json
  {
    "email": "jane.doe@gmail.com",
    "name": "Jane Doe",
    "image": "https://lh3.googleusercontent.com/a/ALm5wu..."
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "7bf31c44-d922-4a0b-9dfd-cdcf6f3fde82",
      "email": "jane.doe@gmail.com",
      "name": "Jane Doe",
      "image": "https://lh3.googleusercontent.com/a/ALm5wu..."
    }
  }
  ```

#### 4. `GET /auth/me`
Retrieves the logged-in user's full context based on the JWT token.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response (`200 OK`)**:
  ```json
  {
    "id": "7bf31c44-d922-4a0b-9dfd-cdcf6f3fde82",
    "email": "jane.doe@gmail.com",
    "name": "Jane Doe",
    "gender": "FEMALE",
    "cycleLength": 28,
    "lastPeriodStart": "2026-05-15T00:00:00.000Z",
    "weight": 62.5,
    "height": 168.0,
    "targetWeight": 58.0,
    "dietPlanEnabled": true,
    "dietType": "NON_VEGETARIAN",
    "isLactoseIntolerant": false,
    "isGlutenFree": false,
    "menstrualTrackingEnabled": true
  }
  ```

#### 5. `PUT /auth/profile`
Updates physical settings, dietary guidelines, and cycle parameters.
- **Request Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "gender": "FEMALE",
    "cycleLength": 29,
    "lastPeriodStart": "2026-05-18T00:00:00.000Z",
    "weight": 63.0,
    "height": 168.0,
    "targetWeight": 58.0,
    "dietPlanEnabled": true,
    "dietType": "VEGETARIAN",
    "isLactoseIntolerant": true,
    "isGlutenFree": false,
    "menstrualTrackingEnabled": true
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "message": "Profile updated successfully",
    "user": {
      "id": "7bf31c44-d922-4a0b-9dfd-cdcf6f3fde82",
      "gender": "FEMALE",
      "cycleLength": 29,
      "lastPeriodStart": "2026-05-18T00:00:00.000Z",
      "weight": 63.0,
      "dietType": "VEGETARIAN"
    }
  }
  ```

---

### 🏋️ Workout Logging Endpoints

#### 1. `GET /workouts`
Fetches all training entries created by the authenticated user, descending from the newest date.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response (`200 OK`)**:
  ```json
  [
    {
      "id": "a90f121e-c0fb-4050-84cf-d84bf4181a94",
      "title": "Leg Day Strength",
      "date": "2026-05-28T18:00:00.000Z",
      "duration": 45,
      "notes": "Felt strong today. High cycle energy.",
      "exercises": [
        {
          "id": "c10f52d0-7a0e-41bc-b5b6-7be1a1964102",
          "name": "Barbell Back Squat",
          "sets": [
            { "id": "s1", "reps": 8, "weight": 80.0 },
            { "id": "s2", "reps": 8, "weight": 85.0 }
          ]
        }
      ]
    }
  ]
  ```

#### 2. `POST /workouts`
Logs a new workout routine, including exercise lists and sets.
- **Request Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Upper Body Push",
    "date": "2026-05-30T10:00:00.000Z",
    "duration": 50,
    "notes": "Dumbbell Press set PRs",
    "exercises": [
      {
        "name": "Incline Dumbbell Press",
        "sets": [
          { "reps": 10, "weight": 24.5 },
          { "reps": 8, "weight": 26.0 }
        ]
      }
    ]
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "message": "Workout logged successfully",
    "workout": {
      "id": "f512c1b8-6a58-450f-90e6-1218df9df8b1",
      "title": "Upper Body Push",
      "date": "2026-05-30T10:00:00.000Z"
    }
  }
  ```

#### 3. `DELETE /workouts/:id`
Deletes a logged routine session.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response (`200 OK`)**:
  ```json
  {
    "message": "Workout session deleted successfully"
  }
  ```

---

### 🌸 Menstrual Tracking Endpoints

#### 1. `GET /menstrual`
Retrieves the list of all cycle journal entries recorded by the user.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response (`200 OK`)**:
  ```json
  [
    {
      "id": "m11c9f02-a0b2-4d1a-8cfa-5be6f9e2b109",
      "startDate": "2026-05-18T00:00:00.000Z",
      "endDate": "2026-05-23T00:00:00.000Z",
      "symptoms": ["cramps", "fatigue"],
      "mood": "calm",
      "energy": 3,
      "notes": "First three days had typical energy depletion."
    }
  ]
  ```

#### 2. `POST /menstrual`
Saves a new cycle log in the personal journal.
- **Request Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "startDate": "2026-05-18T00:00:00.000Z",
    "endDate": "2026-05-23T00:00:00.000Z",
    "symptoms": ["cramps", "fatigue"],
    "mood": "calm",
    "energy": 3,
    "notes": "Typical symptoms."
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "message": "Cycle log recorded successfully",
    "log": {
      "id": "m11c9f02-a0b2-4d1a-8cfa-5be6f9e2b109",
      "startDate": "2026-05-18T00:00:00.000Z"
    }
  }
  ```

#### 3. `DELETE /menstrual/:id`
Removes a specific cycle entry.
- **Request Headers**: `Authorization: Bearer <token>`
- **Response (`200 OK`)**:
  ```json
  {
    "message": "Cycle record deleted successfully"
  }
  ```

---

## 4. Environment Variables Blueprint

To launch local development or coordinate server stacks, populate a `.env` file according to the following template:

```ini
# --- Neon PostgreSQL Connectivity ---
# Connection string with pooled routing configuration
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-glorious-sun-a5sf02.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# --- NextAuth Web Configuration ---
# Standard next-auth URL indicating the client portal
NEXTAUTH_URL="http://localhost:3000"
# Cryptographically random token utilized to encrypt browser cookies
NEXTAUTH_SECRET="f3322d7faefbceab183b27cf189a05b38d38a0f9e1b238cd916"

# --- Google OAuth Secret Core ---
# Acquired from the Google API Credentials Developer console
GOOGLE_CLIENT_ID="583021980345-glorious-auth.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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re"

# --- Fastify API Service Gateway ---
# Local or production Fastify backend endpoint
NEXT_PUBLIC_API_URL="http://localhost:3001"
# Shared JWT registration secret key between NextAuth backend and Fastify
JWT_SECRET="super-symmetric-jwt-encryption-key-for-fastify"
```
