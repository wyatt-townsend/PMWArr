# Build frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

WORKDIR /app 
COPY src src

WORKDIR /app/frontend
COPY frontend ./
RUN npm run build

# Build backend
FROM node:22-alpine AS backend-builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copy frontend build output into backend's public directory
COPY --from=frontend-builder /app/frontend/dist/frontend/browser ./frontend/dist/frontend/browser

RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app

COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/package*.json ./
COPY --from=backend-builder /app/frontend/dist/frontend/browser ./frontend/dist/frontend/browser

EXPOSE 3000

RUN npm install --omit=dev

CMD ["node", "dist/server.js"]