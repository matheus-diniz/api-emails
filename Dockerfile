# Etapa 1: Build do frontend (React)
# FROM node:18.19.0 AS build-frontend
# WORKDIR /app/frontend
# COPY frontend/package*.json ./
# RUN npm install
# COPY frontend/ .
# RUN npm run build

# Etapa 2: Backend (Node.js) + incluir frontend build
# FROM node:18.19.1
# WORKDIR /app

# # Instala dependências do backend
# COPY backend/package*.json ./
# COPY backend/ .
# # Copia o frontend já compilado para uma pasta "public" do backend
# COPY --from=build-frontend /app/frontend/build ./public
# EXPOSE 8080

# # Inicia o backend
# CMD ["npm", "start"]
# --- Stage 1: Build Frontend ---
FROM node:18-slim AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
# --- Stage 2: Build Backend and Copy Frontend Build ---
FROM node:18-slim
WORKDIR /app
# Install backend dependencies
COPY backend/package*.json ./
RUN npm install
# Copy backend source
COPY backend/ ./
# Copy frontend build into backend public folder
COPY --from=build-frontend /app/frontend/dist ./public
# Expose the port Cloud Run expects
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "start"]
