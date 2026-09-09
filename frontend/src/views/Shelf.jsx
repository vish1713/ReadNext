import BookCard from "../components/BookCard.jsx";
import Cover from "../components/Cover.jsx";
import StarRating from "../components/StarRating.jsx";
import { faint, mono } from "../theme.js";

export default function Shelf({ shelf, onOpen, onWant, onRate }) {
  const want = shelf.filter((b) => b.shelf_status === "want");
  const read = shelf.filter((b) => b.shelf_status === "read" || b.shelf_status === "reading");
  return (
    <>
      <div className="rule" />
      <h2 className="shelf-title">Want to read</h2>
      {want.length === 0 ? (
        <p style={{ color: faint, fontSize: 14 }}>Empty for now — tap "Want to read" on anything in Discover.</p>
      ) : (
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {want.map((b) => <BookCard key={b.id} book={b} onOpen={() => onOpen(b)} onWant={() => onWant(b)} />)}
        </div>
      )}
      <div className="rule" />
      <h2 className="shelf-title">Read &amp; reading</h2>
      {read.length === 0 ? (
        <p style={{ color: faint, fontSize: 14 }}>Books you mark as read appear here with your ratings.</p>
      ) : (
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {read.map((b) => (
            <div key={b.id} style={{ width: 150 }}>
              <div onClick={() => onOpen(b)} style={{ cursor: "pointer" }}><Cover book={b} w={148} h={210} /></div>
              <div style={{ marginTop: 6 }}><StarRating value={b.user_rating || 0} onChange={(n) => onRate(b, n)} /></div>
              <div style={{ fontFamily: mono, fontSize: 9, color: faint, textTransform: "uppercase" }}>{b.shelf_status}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
