# Sertta Sales Engine API

Production-grade backend foundation for a multi-tenant SaaS automation platform, built as a modular monolith.

## Stack

- Node.js + TypeScript (strict)
- Express
- MongoDB + Mongoose
- Redis + BullMQ
- Zod
- Pino
- JWT-ready structure

## Quick Start

1. Copy `.env.example` to `.env`.
2. Install dependencies: `npm install`.
3. Start local dependencies (optional): `docker compose up -d mongo redis`.
4. Run API + worker in development: `npm run dev`.

## Scripts

- `npm run dev` starts API and workers in watch mode.
- `npm run build` compiles TypeScript to `dist`.
- `npm run start` starts the API from `dist`.
- `npm run start:worker` starts workers from `dist`.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs strict type-checking.

## Health Endpoints

- `GET /api/health` liveness
- `GET /api/health/ready` readiness (MongoDB + Redis)

## Architecture Notes

- Modular monolith with clear boundaries (`modules/*`).
- Shared collections strategy with tenant-aware design from day one.
- Async processing separated into API and worker runtimes.
- Centralized config, logging, error handling, and request correlation.
