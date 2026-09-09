import { useState } from "react";
import { GENRE_COLORS, faint, ink, serif } from "../theme.js";

/**
 * Real Open Library cover image when available, with a graceful typographic
 * fallback (genre-colored spine + title) when the image is missing or fails.
 */
export default function Cover({ book, w = 148, h = 210 }) {
  const [failed, setFailed] = useState(false);
  const gc = GENRE_COLORS[book.genre] || faint;
  const frame = {
    width: w, height: h, background: "#fff", flexShrink: 0,
    border: `1px solid ${ink}18`, boxShadow: "2px 3px 0 rgba(25,26,30,0.08)",
    display: "flex", overflow: "hidden",
  };

  if (book.cover_url && !failed)
    return (
      <div style={frame}>
        <div style={{ width: 8, background: gc }} />
        <img
          src={book.cover_url} alt={`Cover of ${book.title}`} loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );

  return (
    <div style={frame}>
      <div style={{ width: 8, background: gc }} />
      <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
        <div style={{ fontFamily: serif, fontSize: 15, lineHeight: 1.15, color: ink, overflow: "hidden" }}>{book.title}</div>
        <div style={{ fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: faint }}>{book.author}</div>
      </div>
    </div>
  );
}
