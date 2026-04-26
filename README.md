# CourseHub Backend System

A scalable, production-oriented backend system for a multi-tenant course platform where creators can build and manage courses, and users can purchase, consume, and track learning progress.

This project is designed with real-world backend engineering principles including layered architecture, caching, authentication, and performance optimization.

---

## 🚀 Live API

👉 https://coursehub-backend-system-production.up.railway.app

---

## ✨ Core Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Google OAuth login
- Role-based access (User / Creator)

---

### 🧑‍🏫 Creator Platform (Multi-Tenant)
- Creator accounts with unique handles
- Public creator pages: `/public/:handle/courses`
- Course lifecycle:
  - Create
  - Update
  - Publish / Unpublish

---

### 📚 Course System
- Hierarchical structure:- Preview vs paid lecture access
- Structured content delivery

---

### 🎥 Media Handling
- Cloudinary integration for:
- thumbnails
- lecture videos
- Efficient file handling using Multer

---

### 💳 Purchase System (Core Logic)
- Course purchase tracking
- Access control based on purchase
- Ready for payment gateway integration (Razorpay)

---

### 📈 Progress Tracking
- Track lecture completion
- Course progress APIs
- Enables future analytics & certification

---

### ⚡ Performance & Scalability
- Redis caching for public APIs
- Cache invalidation on data updates
- Pagination on list endpoints
- Optimized DB queries with indexing

---

### 🛡️ Security
- Helmet for HTTP security
- CORS control
- Rate limiting (DoS protection)
- Zod validation for strict input validation
- Request size limits

---

### 📊 Logging
- Structured logging using Pino
- Request-level logging via pino-http

---

## 🧱 Architecture

Follows clean layered architecture:

### Responsibilities:

- **Controllers** → HTTP handling
- **Services** → Business logic
- **Repositories** → DB queries
- **Middleware** → Cross-cutting concerns

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (NeonDB)
- **Cache:** Redis
- **Validation:** Zod
- **Auth:** JWT, Google OAuth
- **Media:** Cloudinary
- **Logging:** Pino
- **Deployment:** Railway
- **Containerization:** Docker

---

## 📂 Project Structure
src/
├── config/
├── controllers/
├── middleware/
├── repositories/
├── routes/
├── services/
├── utils/
└── validators/
---

## ⚙️ Environment Variables

Create `.env` file:

```env
PORT=3000

# Database
PGURI=your_postgres_url

# Auth
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_client_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Redis
REDIS_URL=

## 🚀 Running Locally

```bash
npm install
npm run dev
````

---

## 🐳 Docker

```bash
docker build -t coursehub-backend .
docker run -p 3000:3000 --env-file .env coursehub-backend
```

---

## 📡 Key API Endpoints

### 🔐 Auth

```http
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/google
```

### 🌐 Public

```http
GET /api/public/:handle/courses
GET /api/course/:id/content
```

### 👤 User

```http
GET /api/user/me/courses
POST /api/course/:id/purchase
```

### 📈 Progress

```http
POST /api/progress/lecture/:id/complete
GET /api/progress/course/:id
```

### 🧑‍🏫 Creator

```http
POST /api/creator/course
PATCH /api/creator/course/:id
POST /api/creator/course/:id/publish
```

---

## 🧠 What This Project Demonstrates

* Multi-tenant backend architecture
* Clean code separation (Controller → Service → Repository)
* Real-world caching strategies (Redis)
* Access control & authorization logic
* Media handling at scale
* Production deployment workflow

---

## 📌 Current Limitations

* Payment gateway integration (planned)
* Background job processing (BullMQ not added yet)
* Advanced analytics dashboard

---

## 📝 License

ISC
