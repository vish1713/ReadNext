import BookCard from "../components/BookCard.jsx";
import { faint } from "../theme.js";

export default function Discover({ rows, onOpen, onWant, onDismiss }) {
  if (!rows.length)
    return <p style={{ color: faint, fontSize: 14, marginTop: 30 }}>Mark a few books as read (with ratings) and recommendations will appear here.</p>;
  return rows.map((row) => (
    <section key={row.key}>
      <div className="rule" />
      <h2 className="shelf-title">{row.title}</h2>
      <div className="row-scroll">
        {row.items.map(({ book, reason }) => (
          <BookCard key={book.id} book={book} reason={reason}
            onOpen={() => onOpen(book, reason)}
            onWant={() => onWant(book)}
            onDismiss={() => onDismiss(book)} />
        ))}
      </div>
    </section>
  ));
}
