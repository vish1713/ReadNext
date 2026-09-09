import BookCard from "../components/BookCard.jsx";
import { faint, green, paper, serif } from "../theme.js";

export default function SearchResults({ query, results, searching, onImport, onOpen, onWant }) {
  return (
    <>
      <div className="rule" />
      <h2 className="shelf-title" style={{ fontFamily: serif }}>Results for "{query}"</h2>
      {results.length === 0 && !searching && (
        <p style={{ color: faint, fontSize: 14 }}>Nothing in your catalog matches.</p>
      )}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        {results.map((b) => <BookCard key={b.id} book={b} onOpen={() => onOpen(b)} onWant={() => onWant(b)} />)}
      </div>
      <button onClick={onImport} disabled={searching}
        style={{ marginTop: 20, padding: "10px 18px", fontSize: 13, background: searching ? "#C9C8BF" : green, color: paper, border: "none", cursor: searching ? "default" : "pointer" }}>
        {searching ? "Searching Open Library…" : "Search Open Library for more →"}
      </button>
    </>
  );
}
