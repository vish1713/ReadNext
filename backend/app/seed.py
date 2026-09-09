"""Seed the catalog from Open Library — run once after first start:

    python -m app.seed

Pulls the top works for every genre we support (with cover ids), so the
Discover page has real books and real covers from day one.
"""
import asyncio

from .database import Base, SessionLocal, engine
from .models import Book
from .services.openlibrary import GENRE_SUBJECTS, fetch_subject_books

PER_GENRE = 25


async def seed():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        for genre in GENRE_SUBJECTS:
            print(f"Fetching {genre}…")
            works = await fetch_subject_books(genre, limit=PER_GENRE)
            added = 0
            for data in works:
                if not data["ol_key"]:
                    continue
                if db.query(Book).filter_by(ol_key=data["ol_key"]).first():
                    continue
                db.add(Book(**data))
                added += 1
            db.commit()
            print(f"  added {added}")
        total = db.query(Book).count()
        print(f"Catalog ready: {total} books.")
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(seed())
