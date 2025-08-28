import React, { useEffect, useState } from "react";
import './App.css'; // Importando o novo arquivo de estilos

function App() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openEmailId, setOpenEmailId] = useState(null);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(""); // Limpa erros anteriores ao recarregar
      const res = await fetch("http://localhost:3000/emails", { credentials: "include" });
      if (res.status === 401) {
        window.location.href = "http://localhost:3000/auth";
        return;
      }
      if (!res.ok) {
        throw new Error('Falha na resposta da rede.');
      }
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar emails. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Formata a data para um formato mais legível
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📩 Meus Emails</h1>
        <p>Este app lê sua caixa de entrada do Gmail (somente leitura).</p>
      </header>

      <main className="email-list-container">
        {loading && <div className="loader"></div>}
        {error && <p className="status-message error">{error}</p>}
        {!loading && !error && emails.length === 0 && (
          <p className="status-message">Nenhum email encontrado.</p>
        )}

        <ul className="email-list">
          {emails.map((e) => (
            <li
              key={e.id}
              className={`email-item ${openEmailId === e.id ? 'open' : ''}`}
              onClick={() => setOpenEmailId(openEmailId === e.id ? null : e.id)}
            >
              <div className="email-item-header">
                <div className="email-info">
                  <span className="email-from">{e.from}</span>
                  <span className="email-subject">{e.subject || "(sem assunto)"}</span>
                </div>
                <div className="email-date">{formatDate(e.date)}</div>
              </div>

              <div className="email-content">
                {openEmailId === e.id ? (
                  <div className="email-body full-body">
                    {e.fullBody || e.snippet || "(sem conteúdo)"}
                  </div>
                ) : (
                  <div className="email-body snippet">
                    {e.snippet}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>

      <footer className="app-footer">
        <button className="reload-button" onClick={fetchEmails} disabled={loading}>
          {loading ? 'Carregando...' : '🔄 Recarregar'}
        </button>
      </footer>
    </div>
  );
}

export default App;