# HomeCare Somalia 🏠
**Trusted Help, Happy Home** — Digital Platform for Connecting Households with Domestic Helper Services in Somalia

A full-stack platform built with React (web), React Native (mobile), Node.js + Express (API), and MongoDB.

## Project Structure

```
Connecting HouseHolds/
├── backend/         # Node.js + Express + MongoDB API
├── web/             # React Web App (Households + Admin)
└── mobile/          # React Native + Expo (Workers + Households)
```

## Quick Start

### 1. Backend (API Server)
```bash
cd backend
npm install
# Copy .env.example to .env and fill values (MongoDB URI, JWT secret, etc.)
npm run dev
# Server runs on http://localhost:5000
```

### 2. Setup Admin Account
After backend is running, POST once to seed the default admin:
```
POST http://localhost:5000/api/admin/seed
```

### 3. Web App
```bash
cd web
npm install
npm start
# Opens http://localhost:3000
```

### 4. Mobile App
```bash
cd mobile
npm install
# Edit src/services/api.js — set your local IP address
npx expo start
```

## Default Credentials (after seeding)
- **Admin:** `admin@homecare.so` / `admin123456`

## Features
- ✅ Household & Worker Registration
- ✅ Admin-mediated Worker Verification
- ✅ Worker Search & Filtering
- ✅ Digital Contracts with electronic signatures
- ✅ Real-time In-app Chat (Socket.io)
- ✅ Rating & Review System
- ✅ Worker Dashboard
- ✅ Admin Dashboard (users, contracts, reviews, verifications)
- ✅ Light / Dark Theme
- ✅ Contract Lock (active contract blocks re-hire)

## MongoDB Collections
- `users` — Households & Admin accounts
- `workers` — Worker profiles
- `contracts` — Employment contracts
- `reviews` — Worker ratings and reviews
- `messages` — In-app chat history
- `notifications` — System notifications

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Node.js 22, Express 4, Socket.io 4 |
| Database | MongoDB 8 with Mongoose ODM |
| Web | React 18, React Router v6, Axios |
| Mobile | React Native, Expo SDK 50, React Navigation |
| Auth | JWT, bcryptjs (12 rounds) |

## License
This project is part of an academic research project at Jamhuriya University of Science and Technology (JUST).
