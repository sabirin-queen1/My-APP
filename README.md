# HomeCare Somalia 🏠
**Trusted Help, Happy Home** — Digital Platform for Connecting Households with Domestic Helper Services

## Project Structure

```
Connecting HouseHolds/
├── backend/         # Node.js + Express + MongoDB API
├── web/             # React Web App
└── mobile/          # React Native (Expo) Mobile App
```

## Quick Start

### 1. Backend (API Server)
```bash
cd backend
npm install
# Edit .env — set your MongoDB URI
npm run dev
# Server runs on http://localhost:5000
```

### 2. Setup Admin Account
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
- **Admin:** admin@homecare.so / admin123456

## Features
- ✅ Household & Worker Registration
- ✅ Admin Verification System
- ✅ Worker Search & Filter
- ✅ Digital Contracts with e-signatures
- ✅ Real-time Notifications
- ✅ Rating & Review System
- ✅ Worker Dashboard
- ✅ Admin Dashboard

## MongoDB Collections
- `users` — Households & Admin accounts
- `workers` — Worker profiles
- `contracts` — Employment contracts
- `reviews` — Worker ratings and reviews
- `notifications` — System notifications

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB with Mongoose |
| Web | React 18, React Router v6 |
| Mobile | React Native, Expo, React Navigation |
| Auth | JWT Tokens, bcryptjs |
