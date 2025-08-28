# Gmail Reader - Backend

## Configuração
1. Crie um projeto no Google Cloud Console e ative a **Gmail API**.
2. Crie credenciais **OAuth 2.0** (tipo Aplicativo Web) e adicione:
   - URI de redirecionamento: `http://localhost:3000/auth/callback`
3. Preencha o arquivo `.env` com as suas chaves.

## Rodar
```bash
cd backend
npm install
npm start
```
