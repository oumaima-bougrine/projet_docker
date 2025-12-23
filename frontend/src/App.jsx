import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("App ready");
  const [clicks, setClicks] = useState([]);

  async function fetchClicks() {
    try {
      const res = await fetch(`${API_URL}/api/clicks`);
      if (!res.ok) throw new Error("Erreur lecture");
      const data = await res.json();
      setClicks(data);
    } catch (err) {
      setStatus("Impossible de charger l'historique");
    }
  }

  useEffect(() => {
    fetchClicks();
  }, []);

  async function handleClick() {
    setLoading(true);
    setStatus("Envoi du click...");
    try {
      const res = await fetch(`${API_URL}/api/click`, { method: "POST" });
      if (!res.ok) throw new Error("Erreur serveur");
      setStatus("Click enregistré !");
      await fetchClicks();
    } catch (err) {
      setStatus("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Clickez sur le bouton !</h1>

      <button onClick={handleClick} disabled={loading}>
        {loading ? "Envoi..." : "Clickez"}
      </button>

      <p className="status">{status}</p>

      <section>
        <h2>Derniers clicks</h2>
        {clicks.length === 0 && <p>Aucun geste encore.</p>}
        <ul>
          {clicks.map((c) => (
            <li key={c.id}>
              #{c.id} — {new Date(c.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

