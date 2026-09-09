import { GENRE_COLORS, faint, green, ink, mono, paper, serif } from "../theme.js";
import Cover from "./Cover.jsx";
import StarRating from "./StarRating.jsx";

export default function BookModal({ book, reason, onUpdate, onClose }) {
  const gc = GENRE_COLORS[book.genre] || faint;
  const setStatus = (status) => onUpdate(book.id, { status });
  const setRating = (rating) => onUpdate(book.id, { rating });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(25,26,30,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: paper, maxWidth: 560, width: "100%", padding: 28, border: `1px solid ${ink}`, boxShadow: "6px 6px 0 rgba(25,26,30,0.25)" }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Cover book={book} w={140} h={200} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: gc, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {book.genre}{book.year ? ` · ${book.year}` : ""}
            </div>
            <h2 style={{ fontFamily: serif, fontSize: 28, margin: "6px 0 2px", color: ink, lineHeight: 1.1, fontWeight: 400 }}>{book.title}</h2>
            <div style={{ color: faint, fontSize: 14, marginBottom: 10 }}>{book.author}</div>
            {book.tags?.length > 0 && (
              <div style={{ fontSize: 12, color: ink, marginBottom: 12 }}>themes: {book.tags.slice(0, 6).join(", ")}</div>
            )}
            {reason && <div style={{ fontFamily: mono, fontSize: 10.5, color: green, marginBottom: 14 }}>{reason}</div>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {["want", "reading", "read"].map((s) => (
                <button key={s} onClick={() => setStatus(s)}
                  style={{ fontSize: 11, padding: "6px 10px", border: `1px solid ${green}`, cursor: "pointer", textTransform: "capitalize",
                           background: book.shelf_status === s ? green : "transparent", color: book.shelf_status === s ? paper : green }}>
                  {s === "want" ? "Want to read" : s}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: faint }}>Your rating</span>
              <StarRating value={book.user_rating || 0} onChange={setRating} size={20} />
            </div>
            <div style={{ fontSize: 10, color: faint, marginTop: 6 }}>Ratings retrain your recommendations instantly.</div>
          </div>
        </div>
        <button onClick={onClose} style={{ marginTop: 18, fontSize: 12, border: "none", background: "none", color: faint, cursor: "pointer", textDecoration: "underline" }}>Close</button>
      </div>
    </div>
  );
}
