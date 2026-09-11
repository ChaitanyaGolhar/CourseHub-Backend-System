# CourseHub Backend System

A backend for a course platform where creators manage courses and learners buy, access, and track progress.

## Features

- JWT and Google OAuth authentication
- Role-based access for users and creators
- Creator profile and course management
- Course publishing, access control, and media uploads
- Purchase flow with Razorpay-ready integration
- Progress tracking for lectures and courses
- Redis caching and pagination for performance
- Zod validation, rate limiting, and security middleware
- Structured logging with Pino

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Redis
- Zod
- Cloudinary
- Docker

## Project Structure

```text
src/
├── config/
├── controllers/
├── middleware/
├── repositories/
├── routes/
├── services/
├── utils/
├── validators/
└── app.js
```

## Architecture

The app follows a layered structure:

Request → Route → Controller → Service → Repository → Database

## Environment Variables

Create a `.env` file with:

```env
PORT=3000
PGURI=your_postgres_url
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_client_id
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
REDIS_URL=
```

## Run Locally

```bash
npm install
npm run dev
```

## Docker

```bash
docker build -t coursehub-backend .
docker run -p 3000:3000 --env-file .env coursehub-backend
```

## Key API Routes

```http
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/google
GET /api/public/:handle/courses
GET /api/course/:id/content
GET /api/user/me/courses
POST /api/course/:id/purchase
POST /api/progress/lecture/:id/complete
GET /api/progress/course/:id
POST /api/creator/course
PATCH /api/creator/course/:id
POST /api/creator/course/:id/publish
```

## Notes

This project is designed to demonstrate a practical multi-tenant backend setup with clean separation of concerns, caching, auth, media handling, and production-oriented API patterns.

## License

ISC
