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

FROM node

WORKDIR backend
CMD [ "npm", "install" ]
CMD [ "npm", "start" ]

