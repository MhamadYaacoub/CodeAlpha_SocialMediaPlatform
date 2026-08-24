# Socially

<p align="center">
  A modern, responsive social platform for sharing posts and stories, building mutual connections, and having private conversations.
</p>

<p align="center">
  <img alt="Angular 21" src="https://img.shields.io/badge/Angular-21-DD0031?logo=angular">
  <img alt="Node.js 22" src="https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white">
  <img alt="Express 5" src="https://img.shields.io/badge/Express-5-111111?logo=express">
  <img alt="PostgreSQL 17" src="https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white">
  <img alt="Responsive UI" src="https://img.shields.io/badge/UI-Responsive-8B5CF6">
</p>

## Overview

Socially is a full-stack social media application with an Angular single-page frontend and an Express/PostgreSQL API. It includes real profile media, global posts, 24-hour stories, follow-request workflows, notifications, persistent likes and comments, and private messaging restricted to mutual followers.

The interface uses a custom dark “Obsidian Aurora” design system with responsive desktop and mobile navigation, accessible focus states, consistent interactive controls, and dedicated mobile conversation views.

## Features

### Accounts and profiles

- Secure registration and login with bcrypt password hashing and JWT authentication
- Protected application routes and automatic handling of expired or deleted sessions
- Editable display name, biography, and uploaded profile image
- Public profiles with posts, follower counts, following counts, and relationship state
- Search and discovery by display name or username

### Social graph

- Follow requests with pending, accept, decline, unfollow, and follow-back states
- Followers and following lists
- Suggestions automatically exclude followed users and pending requests
- Follow controls synchronized across feeds, discovery, and profiles

### Posts and engagement

- Global chronological feed containing posts from all users
- Text, image, video, and optional music attachments
- Camera and gallery access on supported mobile devices
- Persistent, idempotent likes with optimistic UI updates
- Double-click or double-tap media liking
- Comments, counts, and owner-restricted deletion

### Stories

- Image/video stories with optional text and music
- Automatic expiration after 24 hours
- Stories visible only from the signed-in user and followed accounts
- Unseen-first ordering and unique view tracking
- Story owner viewer list

### Notifications and messaging

- Notifications for likes, comments, follow requests, accepted requests, and messages
- Unread notification and message counters
- Private conversations available only while both users follow each other
- Automatic mutual-follower conversation list
- Per-conversation unread counts and read state
- Mobile list-to-chat navigation with a dedicated back action

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | Angular 21, TypeScript, RxJS, SCSS |
| Backend | Node.js 22, Express 5 |
| Database | PostgreSQL, Sequelize ORM |
| Authentication | JSON Web Tokens, bcrypt |
| Realtime foundation | Socket.IO |
| Deployment | Render Blueprint, managed PostgreSQL |

## Architecture

~~~mermaid
flowchart LR
    Browser[Angular SPA] -->|REST /api| API[Express API]
    Browser <-->|Socket.IO| API
    API --> ORM[Sequelize]
    ORM --> DB[(PostgreSQL)]
    API --> Media[Uploaded media]
~~~

In production, Express serves the compiled Angular application and API from the same origin. In development, Angular's proxy forwards /api and /uploads to the backend.

## Project structure

~~~text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── uploads/
├── frontend/
│   ├── src/app/
│   │   ├── core/
│   │   ├── features/
│   │   ├── layout/
│   │   └── shared/
│   └── proxy.conf.json
├── render.yaml
└── package.json
~~~

## Local development

### Prerequisites

- Node.js 22.12 or newer
- npm 10 or newer
- PostgreSQL 17 or another currently supported PostgreSQL release

### 1. Clone and install

~~~bash
git clone <your-repository-url>
cd CodeAlpha_SocialMediaPlatform
npm run install:all
~~~

### 2. Configure PostgreSQL

~~~sql
CREATE DATABASE codealpha_social_media;
~~~

Copy the environment template:

~~~bash
cp backend/.env.example backend/.env
~~~

Windows PowerShell:

~~~powershell
Copy-Item backend/.env.example backend/.env
~~~

Update backend/.env:

~~~dotenv
PORT=5001
FRONTEND_URL=http://localhost:4200
DB_HOST=localhost
DB_PORT=5432
DB_NAME=codealpha_social_media
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=replace_with_a_long_random_secret
~~~

Sequelize creates the required tables when the API starts.

### 3. Start the application

Backend terminal:

~~~bash
npm run dev --prefix backend
~~~

Frontend terminal:

~~~bash
npm start --prefix frontend
~~~

Open [http://localhost:4200](http://localhost:4200). The development API runs at [http://localhost:5001](http://localhost:5001).

## Available scripts

| Command | Purpose |
| --- | --- |
| npm run install:all | Install backend and frontend dependencies |
| npm run build | Create the production Angular build |
| npm start | Start the production Express server |
| npm run dev --prefix backend | Start the API with Nodemon |
| npm start --prefix frontend | Start Angular's development server |

## API overview

All application endpoints use the /api prefix.

| Area | Examples |
| --- | --- |
| Authentication | /api/auth/register, /api/auth/login |
| Users | /api/users, /api/users/:id |
| Posts | /api/posts, /api/posts/:id/like |
| Comments | /api/posts/:id/comments |
| Relationships | /api/users/:id/follow, /api/follow-requests/:id |
| Stories | /api/statuses, /api/statuses/:id/view |
| Notifications | /api/notifications |
| Messages | /api/conversations, /api/conversations/:id/messages |
| Health check | /api/health |

Authenticated endpoints require:

~~~http
Authorization: Bearer <token>
~~~

## Deployment

The included render.yaml defines:

- One Node.js web service that builds Angular and runs Express
- One managed PostgreSQL 17 database
- A generated production JWT secret
- A health check at /api/health

After pushing the repository to GitHub:

1. Sign in to [Render](https://render.com).
2. Choose **New → Blueprint**.
3. Connect this GitHub repository.
4. Confirm the resources and select **Apply**.
5. Open the generated onrender.com URL after deployment succeeds.

See Render's [Blueprint specification](https://render.com/docs/blueprint-spec).

> [!IMPORTANT]
> Local file uploads are suitable for development. Free Render services use an ephemeral filesystem, so uploaded media can be removed during redeploys or restarts. For durable production media, configure Cloudinary/S3-compatible object storage or attach a persistent disk and set UPLOAD_DIR.

## Security notes

- Never commit backend/.env or production credentials.
- Use a long, randomly generated JWT_SECRET.
- Restrict FRONTEND_URL when deploying frontend and backend separately.
- Use HTTPS in production.
- Add rate limiting, email verification, password reset, and content moderation before operating a public community.
- Replace automatic schema synchronization with reviewed migrations for long-lived databases.

## Verification

~~~bash
npm run build
npm run check
~~~

The project has also been validated with Angular's template compiler and backend JavaScript syntax checks.

## Contributing

Issues and focused pull requests are welcome. For substantial changes, open an issue first to describe the proposed behavior and implementation.

---

Built as a full-stack social media portfolio project.
