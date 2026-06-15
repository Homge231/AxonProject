<<<<<<< HEAD
# AxonProject
=======
# ARENA.ENG

A web-based arena game project with a Vue 3 + TypeScript frontend and an Express/Colyseus backend.

## Overview

This repository contains a multiplayer game prototype built as a full-stack application.
- `client/`: Vue 3 app using Vite, Phaser, Pinia, and Tailwind CSS for the game UI.
- `server/`: Express-based backend with Colyseus support for real-time multiplayer game servers.

## Features

- Phaser game engine integration for browser-based gameplay
- Vue 3 frontend with TypeScript and Vite
- Lobby UI and game scene setup
- Express server with a health endpoint and multiplayer server support

## Tech stack

- Frontend: Vue 3, TypeScript, Vite, Phaser, Pinia, Vue Router, Tailwind CSS
- Backend: Express, Colyseus, dotenv, CORS

## Project structure

- `client/`: frontend source code and configuration
- `server/`: backend source code and server configuration
- `client/src/game/`: Phaser game initialization
- `client/src/views/`: Vue views and lobby UI
- `server/src/index.ts`: Express server entrypoint

## Run locally

1. Install client dependencies:
   ```bash
   cd client
   npm install
   npm run dev
   ```

2. Install server dependencies and start the server:
   ```bash
   cd ../server
   npm install
   npm run dev
   ```

3. Open the frontend in your browser via Vite and verify the backend at `http://localhost:3000/health`.
>>>>>>> d3afa7fb45e22d1f6234c2e379ffd821955514c6
