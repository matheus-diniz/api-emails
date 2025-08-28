# Gmail Reader (Node + React)

Projeto completo para autenticar com Google OAuth, ler emails do Gmail e exibir no frontend.

## Como usar

### 1) Configurar Google Cloud
- Ative a **Gmail API**.
- Crie credenciais **OAuth 2.0** (Aplicativo Web).
- Adicione **URI de redirecionamento**: `http://localhost:3000/auth/callback`.

### 2) Backend
```bash
cd backend
cp .env .env.local # opcional
# Edite .env com suas chaves
npm install
npm start
```

### 3) Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Abra: `http://localhost:5173`

> Obs.: Para produção pública, apps OAuth precisam de verificação do Google.
