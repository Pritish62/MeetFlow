# MeetFlow (MERN Video Conferencing App)

MeetFlow is a full-stack video meeting project with:

- React + Vite frontend
- Node.js + Express backend
- MongoDB for user/meeting data
- Socket.IO signaling for real-time meeting communication

This repository is split into two apps:

- `FRONTEND/` for UI and meeting client
- `BACKEND/` for authentication, API routes, DB connection, and Socket.IO server

## Project Structure

```text
ZOOM/
  BACKEND/
    app.js
    controller/
      socketCntroller.js
      userController.js
    models/
      meeting.js
      user.js
    routes/
      userRoute.js
    package.json
  FRONTEND/
    src/
      components/
      contexts/
      layouts/
      pages/
      router/
    package.json
    vite.config.js
  README.md
```

## Tech Stack

### Frontend
- React 19
- Vite 7
- React Router
- Axios
- Material UI
- Socket.IO Client

### Backend
- Node.js (ES Modules)
- Express 5
- Socket.IO
- Mongoose
- bcryptjs
- dotenv
- cors

## Current Features

### Implemented
- User registration API (`POST /users/register`)
- User login API (`POST /users/login`)
- Token generation and persistence in DB on login
- Frontend auth forms (Register/Login)
- Token persisted in `localStorage`
- Lobby-like meeting entry UI in `VideoMeet`
- Socket connection and room join event (`join-call`)
- Basic signaling events (`signal`, `user-left`, chat event wiring)

### Partially Implemented / In Progress
- Meeting screen UI after lobby
- Full WebRTC media stream handling
- Chat rendering and message history UI
- Persistent meeting/activity APIs (`/add_to_activity`, `/get_all_activity` are declared but not implemented)

## Routing Overview

Frontend routes (`FRONTEND/src/router/router.jsx`):

- `/` -> Landing page
- `/home` -> Home page
- `/register` -> Register page
- `/login` -> Login page
- `/:url` -> Video meeting page (dynamic meeting path)

Backend routes (`BACKEND/routes/userRoute.js`):

- `POST /users/register`
- `POST /users/login`

## API Contract (Current)

### Register
`POST /users/register`

Request body:

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "secret123"
}
```

Success response (201):

```json
{
  "message": "User created",
  "username": "john",
  "email": "john@example.com"
}
```

### Login
`POST /users/login`

Request body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

Success response (200):

```json
{
  "token": "<random_token>",
  "username": "john",
  "email": "john@example.com"
}
```

## Socket.IO Events (Current)

Client emits:

- `join-call` -> `(path)`
- `signal` -> `(toId, message)`
- `chat-message` -> `(data, sender)`

Server emits:

- `user-joined` -> `(socketId, connections[path])`
- `signal` -> `(fromSocketId, message)`
- `chat-message` -> `(data, sender, socketId)`
- `user-left` -> `(socketId)`

## Environment Variables

Create `BACKEND/.env`:

```env
MONGO_URL=mongodb://127.0.0.1:27017/meetflow
PORT=8000
```

Note: current backend code reads `process.env.POST` (not `PORT`). You can either:

1. Set `POST=8000` in `.env`, or
2. Update backend code to use `process.env.PORT`.

## Local Development Setup

## 1) Clone and install

From project root:

```bash
cd BACKEND
npm install

cd ../FRONTEND
npm install
```

## 2) Start backend

```bash
cd BACKEND
npm run dev
```

Backend runs on: `http://localhost:8000`

## 3) Start frontend

Open another terminal:

```bash
cd FRONTEND
npm run dev
```

Frontend runs on Vite default URL (usually): `http://localhost:5173`

## Scripts

### Backend scripts

- `npm run dev` -> start with nodemon
- `npm start` -> start with node
- `npm run prod` -> run with pm2

### Frontend scripts

- `npm run dev` -> start Vite dev server
- `npm run build` -> production build
- `npm run preview` -> preview production build
- `npm run lint` -> run ESLint

## Data Models

### User
Defined in `BACKEND/models/user.js`:

- `username` (String, unique, required)
- `email` (String, unique, required)
- `password` (String, required, hashed)
- `token` (String)

### Meeting
Defined in `BACKEND/models/meeting.js`:

- `user_id` (String, required)
- `meetingCode` (String, required)
- `createdAt` (Date, default now)

## Known Gaps / Cleanup Suggestions

- Typo in port env key (`POST` vs `PORT`) in backend app setup.
- Typo in socket event listener in frontend (`user-joind` should match `user-joined`).
- `socketCntroller.js` file name contains a typo (`Cntroller` vs `Controller`).
- `BACKEND/package.json` includes dependencies that appear unnecessary for backend (`react`, `bcrypt` and `bcryptjs` both present, `cores` likely typo for `cors`).
- `dotenv` is imported twice in backend app setup.
- Login/Register page links currently use `href="#"` in places; these can be moved to router navigation.
- `Home` and post-lobby `VideoMeet` UI are still minimal.

## Recommended Next Improvements

1. Complete WebRTC call lifecycle (`offer/answer/ICE`) with stable state handling.
2. Implement activity/meeting history endpoints and connect them to frontend.
3. Add route guards for authenticated pages.
4. Move API base URLs and socket URL to environment-based frontend config.
5. Add validation (both frontend and backend) and centralized error responses.
6. Add tests for auth controller and socket event behavior.

## License

No license has been defined yet in this repository.
