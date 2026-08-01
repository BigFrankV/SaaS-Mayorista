# syntax=docker/dockerfile:1

# Stage 1: build the SPA (React + Vite + TypeScript) with Node 22
FROM node:22-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: serve the static build with the same nginx image used by the compose
# `frontend` service (infra/docker/prod/docker-compose.yml mounts the nginx.conf).
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
