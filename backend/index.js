import express from "express";
import session from "express-session";
import { google } from "googleapis";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // para ambiente local sem HTTPS
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

    // Verifique se req.session existe
    if (!req.session) {
      console.error("req.session não inicializada!");
      return res.status(500).send("Erro na sessão");
    }

    req.session.tokens = tokens;
    res.send("Autenticado com sucesso!");
  } catch (err) {
    // Mostra todos os detalhes do erro
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

app.listen(3000, () => console.log("🚀 Backend rodando em http://localhost:3000"));
