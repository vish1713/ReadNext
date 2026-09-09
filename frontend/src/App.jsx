import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import BookModal from "./components/BookModal.jsx";
import { green, ink, paper, serif } from "./theme.js";
import Discover from "./views/Discover.jsx";
import Onboarding from "./views/Onboarding.jsx";
import SearchResults from "./views/SearchResults.jsx";
import Shelf from "./views/Shelf.jsx";

export default function App() {
  const [booted, setBooted] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [tab, setTab] = useState("discover");
  const [rows, setRows] = useState([]);
  const [shelf, setShelf] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [modal, setModal] = useState(null); // { book, reason }
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [recRows, shelfBooks] = await Promise.all([api.getRecommendations(), api.getShelf()]);
      setRows(recRows);
      setShelf(shelfBooks);
      setError(null);
    } catch (e) {
      setError("Can't reach the API. Is the backend running on :8000?");
    }
  }, []);

  useEffect(() => {
    api.getPreferences()
      .then((prefs) => { setNeedsOnboarding(prefs.length === 0); setBooted(true); return refresh(); })
      .catch(() => { setError("Can't reach the API. Is the backend running on :8000?"); setBooted(true); });
  }, [refresh]);

  // Local catalog search, debounced
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(() => api.listBooks({ q: query.trim() }).then(setResults).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [query]);

  const update = async (bookId, body) => {
    await api.updateShelf(bookId, body);
    await refresh();
    if (modal?.book.id === bookId) {
      const fresh = (await api.getShelf()).find((b) => b.id === bookId);
      if (fresh) setModal((m) => ({ ...m, book: fresh }));
    }
  };
  const toggleWant = async (book) => {
    book.shelf_status === "want" ? await api.removeFromShelf(book.id) : await api.updateShelf(book.id, { status: "want" });
    refresh();
  };
  const dismissBook = async (book) => { await api.dismiss(book.id); refresh(); };
  const importFromOL = async () => {
    setSearching(true);
    try { await api.importBooks(query.trim()); setResults(await api.listBooks({ q: query.trim() })); }
    finally { setSearching(false); }
  };

  if (!booted) return null;
  if (needsOnboarding)
    return <Onboarding onDone={() => { setNeedsOnboarding(false); refresh(); }} />;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 20px 80px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{ fontFamily: serif, fontSize: 26 }}>Spine<span style={{ color: green }}>ward</span></div>
        <nav style={{ display: "flex", gap: 4 }}>
          {["discover", "shelf"].map((t) => (
            <button key={t} onClick={() => { setTab(t); setQuery(""); }}
              style={{ fontSize: 13, padding: "6px 12px", border: "none", cursor: "pointer", textTransform: "capitalize",
                       background: tab === t ? ink : "transparent", color: tab === t ? paper : ink }}>
              {t === "shelf" ? `My shelf (${shelf.length})` : "Discover"}
            </button>
          ))}
        </nav>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or author…"
          style={{ marginLeft: "auto", padding: "8px 12px", fontSize: 13, border: `1px solid ${ink}40`, background: "#fff", minWidth: 220, fontFamily: "inherit" }} />
      </header>

      {error && <p style={{ color: "#A4243B", fontSize: 13, marginTop: 16 }}>{error}</p>}

      {query.trim() ? (
        <SearchResults query={query} results={results} searching={searching} onImport={importFromOL}
          onOpen={(b) => setModal({ book: b })} onWant={toggleWant} />
      ) : tab === "discover" ? (
        <Discover rows={rows} onOpen={(b, reason) => setModal({ book: b, reason })} onWant={toggleWant} onDismiss={dismissBook} />
      ) : (
        <Shelf shelf={shelf} onOpen={(b) => setModal({ book: b })} onWant={toggleWant} onRate={(b, n) => update(b.id, { rating: n })} />
      )}

      {modal && <BookModal book={modal.book} reason={modal.reason} onUpdate={update} onClose={() => setModal(null)} />}
    </div>
  );
}
