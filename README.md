# ARENA.ENG — Naenra

A web-based typing esports arena built with Vue 3 + TypeScript frontend and an Express/Colyseus backend.

## Overview

Naenra is a multiplayer typing game where players compete in real-time ranked matches.
- `client/`: Vue 3 app using Vite, Phaser, Pinia, and Tailwind CSS
- `server/`: Express-based backend with Colyseus support for real-time multiplayer

## Tech Stack

**Frontend:** Vue 3, TypeScript, Vite 8, Phaser 4, Pinia 3, Vue Router 5, Tailwind CSS 3, Supabase JS 2

**Backend:** Node.js, Express 5, TypeScript, Colyseus 0.17, Supabase JS 2, bcrypt, jsonwebtoken, nodemailer, dotenv

## Project Structure

```
client/
  src/
    game/        # Phaser game initialization and scenes
    views/       # Vue views (Login, Home, Profile, etc.)
    stores/      # Pinia stores (auth, error, game)
    router/      # Vue Router with auth guards
    components/  # Reusable components
server/
  src/
    routes/      # Auth and user routes
    controllers/ # User profile controller
    middleware/  # JWT auth middleware
    utils/       # JWT, OTP, mailer utilities
```

## Run Locally

```bash
# Client
cd client
npm install
npm run dev

# Server (new terminal)
cd server
npm install
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3000/health

## Environment Variables

**`client/.env`**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SERVER_URL=http://localhost:3000
VITE_SITE_URL=http://localhost:5173
```

**`server/.env`**
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
RESEND_API_KEY=
MAIL_FROM=
```

## Deployment (Render)

**Server — Web Service:**
- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- URL: https://axonproject-1.onrender.com

**Client — Static Site:**
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- URL: https://axonproject.onrender.com
- Custom Domain: https://naenra.xyz

**Client ENV on Render:**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SERVER_URL=https://axonproject-1.onrender.com
VITE_SITE_URL=https://naenra.xyz
```

**Server ENV on Render:**
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
RESEND_API_KEY=
MAIL_FROM=
```

**CORS Origins (server):**
- https://naenra.xyz
- https://www.naenra.xyz
- https://axonproject.onrender.com
- http://localhost:5173

**Supabase:**
- Site URL: https://naenra.xyz
- Redirect URLs: https://naenra.xyz/**, https://www.naenra.xyz/**