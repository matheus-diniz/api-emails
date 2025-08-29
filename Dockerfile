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

# Usar imagem Node oficial compatível com Cloud Run
FROM node:18-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json primeiro (melhora cache)
COPY backend/package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY backend/ ./

# (Opcional) copiar .env se quiser buildar junto 
# mas o recomendado no Google Cloud é usar "Config Vars/Secrets"
# COPY backend/.env .env.local

# Expor a porta usada pelo app
EXPOSE 8080

# Definir variável de ambiente padrão do GCP
ENV PORT=8080

# Rodar a aplicação
CMD ["npm", "start"]

