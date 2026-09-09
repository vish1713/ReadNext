import { faint, green, ink, mono, paper } from "../theme.js";
import Cover from "./Cover.jsx";

/** One book in a shelf row: cover, "why" chip, want-to-read / dismiss actions. */
export default function BookCard({ book, reason, onOpen, onWant, onDismiss }) {
  const onShelf = book.shelf_status === "want";
  return (
    <div style={{ width: 150, flexShrink: 0 }}>
      <div onClick={onOpen} style={{ cursor: "pointer" }}>
        <Cover book={book} w={148} h={210} />
      </div>
      {reason && (
        <div style={{ fontFamily: mono, fontSize: 9.5, color: green, margin: "8px 0 4px", lineHeight: 1.35 }}>{reason}</div>
      )}
      <div style={{ display: "flex", gap: 6, marginTop: reason ? 2 : 8 }}>
        <button onClick={onWant}
          style={{ flex: 1, fontSize: 11, padding: "5px 0", border: `1px solid ${green}`, cursor: "pointer",
                   background: onShelf ? green : "transparent", color: onShelf ? paper : green }}>
          {onShelf ? "On shelf ✓" : "Want to read"}
        </button>
        {onDismiss && (
          <button onClick={onDismiss} title="Not interested"
            style={{ fontSize: 11, padding: "5px 8px", border: `1px solid ${ink}30`, background: "transparent", color: faint, cursor: "pointer" }}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
