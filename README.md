# DevPulse – Internal Tech Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions. Built with Node.js, TypeScript, Express.js, and PostgreSQL.

## 🚀 Live Deployment

- **Live API URL**: `https://dev-pulse-orcin-three.vercel.app/`
- **GitHub Repository**: `https://github.com/sumonkhan0077/DevPulse`

## ✨ Features

- **User Authentication**: Secure registration and login with JWT-based authentication
- **Role-Based Access Control**: Two user roles (contributor and maintainer) with different permissions
- **Issue Management**: Create, read, update, and delete bug reports and feature requests
- **Advanced Filtering**: Filter issues by type, status, and sort by date
- **Secure Password Storage**: Passwords hashed using bcrypt with salt rounds
- **Raw SQL Queries**: Direct PostgreSQL queries without ORMs for optimal performance
- **RESTful API**: Clean and consistent API design following REST principles

## 🛠️ Technology Stack

| Technology       | Purpose                                 |
| ---------------- | --------------------------------------- |
| **Node.js**      | Runtime environment (v24.x or higher)   |
| **TypeScript**   | Type-safe development                   |
| **Express.js**   | Web framework with modular routing      |
| **PostgreSQL**   | Relational database                     |
| **pg**           | Native PostgreSQL driver (raw SQL only) |
| **bcrypt**       | Password hashing and security           |
| **jsonwebtoken** | JWT authentication                      |
| **dotenv**       | Environment variable management         |

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js (v24.x or higher)
- PostgreSQL database (NeonDB)
- npm package manager

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/sumonkhan0077/DevPulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
CONNECTIONSTRING=your_postgresql_connection_string
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

### 4. Run the application

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 🗄️ Database Schema

### Users Table

| Field      | Type         | Constraints                                           |
| ---------- | ------------ | ----------------------------------------------------- |
| id         | SERIAL       | PRIMARY KEY                                           |
| name       | VARCHAR(80) | NOT NULL                                              |
| email      | VARCHAR(100) | UNIQUE, NOT NULL                                      |
| password   | TEXT         | NOT NULL                                              |
| role       | VARCHAR(50)  | DEFAULT 'contributor', CHECK (contributor/maintainer) |
| created_at | TIMESTAMP    | DEFAULT NOW()                                         |
| updated_at | TIMESTAMP    | DEFAULT NOW()                                         |

### Issues Table

| Field       | Type         | Constraints                                       |
| ----------- | ------------ | ------------------------------------------------- |
| id          | SERIAL       | PRIMARY KEY                                       |
| title       | VARCHAR(150) | NOT NULL                                          |
| description | TEXT         | NOT NULL                                          |
| type        | VARCHAR(50)  | CHECK (bug/feature_request)                       |
| status      | VARCHAR(50)  | DEFAULT 'open', CHECK (open/in_progress/resolved) |
| reporter_id | INT          | NOT NULL                                          |
| created_at  | TIMESTAMP    | DEFAULT NOW()                                     |
| updated_at  | TIMESTAMP    | DEFAULT NOW()                                     |

## 🌐 API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  }
}
```

### Issues Management

#### Create Issue

```http
POST /api/issues
Authorization: <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

#### Get All Issues

```http
GET /api/issues?sort=newest&type=bug&status=open
```

**Query Parameters:**

- `sort`: `newest` (default) or `oldest`
- `type`: `bug` or `feature_request` (optional)
- `status`: `open`, `in_progress`, or `resolved` (optional)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  ]
}
```

#### Get Single Issue

```http
GET /api/issues/:id
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

#### Update Issue

```http
PATCH /api/issues/:id
Authorization: <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps...",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

#### Delete Issue

```http
DELETE /api/issues/:id
Authorization: <JWT_TOKEN>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

## 👥 User Roles & Permissions

### Contributor

- Register and log in
- Create new issues (bug or feature request)
- View all issues
- Update own issues (only when status is 'open')

### Maintainer

- All contributor permissions
- Update any issue field
- Delete any issue
- Change issue workflow status independently

##  Authentication Flow

1. User registers or logs in with credentials
2. Server validates and returns JWT token
3. Client includes token in `Authorization` header for protected routes
4. Server verifies token signature and expiry before processing requests

## 📁 Project Structure

```
devpulse/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment configuration
│   ├── db/
│   │   └── index.ts            # Database connection & initialization
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication & authorization
│   │   ├── express.d.ts        # TypeScript type extensions
│   │   └── globalErrorHandler.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.route.ts
│   │   │   └── auth.types.ts
│   │   └── issues/
│   │       ├── issues.controller.ts
│   │       ├── issues.service.ts
│   │       ├── issues.route.ts
│   │       └── issues.types.ts
│   ├── utils/
│   │   └── sendResponse.ts     # Standardized response utility
│   ├── app.ts                  # Express app configuration
│   └── server.ts               # Server entry point
├── .env                        # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚨 Error Handling

### HTTP Status Codes

| Code | Meaning               | Usage                                    |
| ---- | --------------------- | ---------------------------------------- |
| 200  | OK                    | Successful GET, PATCH, DELETE            |
| 201  | Created               | Successful POST (resource created)       |
| 400  | Bad Request           | Validation errors, invalid input         |
| 401  | Unauthorized          | Missing, expired, or invalid JWT         |
| 403  | Forbidden             | Valid token but insufficient permissions |
| 404  | Not Found             | Requested resource does not exist        |
| 409  | Conflict              | Business logic conflict                  |
| 500  | Internal Server Error | Unexpected server error                  |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds (10)
- **JWT Authentication**: Secure token-based authentication with 7-day expiry
- **SQL Injection Prevention**: Parameterized queries
- **Role-Based Access Control**: Granular permissions based on user roles
- **Environment Variables**: Sensitive data stored securely

## 🧪 Testing the API

You can test the API using:

- **Postman**: Import the endpoints and test manually
- **cURL**: Command-line testing
- **Thunder Client**: VS Code extension

### Example cURL Request

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "contributor"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Create an issue (replace YOUR_TOKEN with actual JWT)
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_TOKEN" \
  -d '{
    "title": "Bug in login form",
    "description": "The login form does not validate email format properly",
    "type": "bug"
  }'
```

##  Development Notes

- **No ORMs**: This project uses raw SQL queries with the native `pg` driver
- **No SQL JOINs**: Reporter details are fetched separately to avoid JOINs
- **TypeScript Strict Mode**: Enabled for type safety
- **Modular Architecture**: Clean separation of concerns (controller → service → database)
- **Connection Pooling**: PostgreSQL connection pool for optimal performance

##  Contributing

This is an academic assignment project. Contributions are not accepted.

## License

This project is created for educational purposes as part of a programming assignment.

## 👨‍💻 Author

**Md Sumon Khan**



**Note**: Remember to replace placeholder URLs and personal information with your actual deployment links and details before submission.