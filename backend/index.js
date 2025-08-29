import express from "express";
import session from "express-session";
import { google } from "googleapis";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// recria __dirname para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Habilita CORS (ajuste o origin conforme necessário)
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));

// Servir arquivos do frontend compilado (React build)
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // em prod no Cloud Run você pode trocar para true (com HTTPS)
  })
);

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// Login Google
app.get("/auth", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
  res.redirect(url);
});

// Callback OAuth
app.get("/auth/callback", async (req, res) => {
  try {
    const { code } = req.query;
    console.log("Código recebido do Google:", code);

    const { tokens } = await oAuth2Client.getToken(code);
    console.log("Tokens recebidos:", tokens);

    if (!req.session) {
      console.error("req.session não inicializada!");
      return res.status(500).send("Erro na sessão");
    }

    req.session.tokens = tokens;
    res.send("Autenticado com sucesso!");
  } catch (err) {
    console.error("Erro detalhado OAuth:", JSON.stringify(err.response?.data || err, null, 2));
    res.status(500).send("Erro na autenticação Google");
  }
});

// Lista emails
app.get("/emails", async (req, res) => {
  try {
    if (!req.session.tokens) return res.status(401).json({ error: "Não autenticado" });

    oAuth2Client.setCredentials(req.session.tokens);
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const list = await gmail.users.messages.list({ userId: "me", maxResults: 10 });
    if (!list.data.messages || list.data.messages.length === 0) {
      return res.json([]);
    }

    const emails = [];
    for (const msg of list.data.messages) {
      const detail = await gmail.users.messages.get({ userId: "me", id: msg.id });
      const headers = detail.data.payload?.headers || [];
      const getH = (name) => headers.find((h) => h.name === name)?.value || "";
      emails.push({
        id: msg.id,
        date: getH("Date"),
        from: getH("From"),
        to: getH("To"),
        subject: getH("Subject"),
        snippet: detail.data.snippet || "",
      });
    }

    res.json(emails);
  } catch (err) {
    console.error("Erro ao buscar emails:", err);
    res.status(500).json({ error: "Falha ao buscar emails" });
  }
});

// fallback para SPA (React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Cloud Run define a porta em process.env.PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Backend rodando na porta ${PORT}`));
