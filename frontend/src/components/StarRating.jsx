import { gold } from "../theme.js";

export default function StarRating({ value = 0, onChange, size = 18 }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange?.(n)} aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          style={{ color: value >= n ? gold : "#CFCEC6", fontSize: size, lineHeight: 1, background: "none", border: "none", cursor: onChange ? "pointer" : "default", padding: 1 }}>
          ★
        </button>
      ))}
    </span>
  );
}
