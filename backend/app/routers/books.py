from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import BookOut
from ..services import openlibrary as ol

router = APIRouter(prefix="/books", tags=["books"])


def to_out(b: models.Book, entry: models.ShelfEntry | None = None) -> BookOut:
    out = BookOut.model_validate(b)
    out.cover_url = ol.cover_url(b.cover_id)
    if entry:
        out.shelf_status, out.user_rating = entry.status, entry.rating
    return out


@router.get("", response_model=list[BookOut])
def list_books(q: str | None = None, genre: str | None = None,
               limit: int = Query(50, le=200), db: Session = Depends(get_db)):
    query = db.query(models.Book)
    if genre:
        query = query.filter(models.Book.genre == genre)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(models.Book.title.ilike(like), models.Book.author.ilike(like)))
    books = query.order_by(models.Book.rating.desc()).limit(limit).all()
    entries = {e.book_id: e for e in db.query(models.ShelfEntry).all()}
    return [to_out(b, entries.get(b.id)) for b in books]


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, db: Session = Depends(get_db)):
    b = db.get(models.Book, book_id)
    if not b:
        raise HTTPException(404, "Book not found")
    entry = db.query(models.ShelfEntry).filter_by(book_id=book_id).first()
    return to_out(b, entry)


@router.post("/import", response_model=list[BookOut])
async def import_books(q: str, genre: str | None = None, db: Session = Depends(get_db)):
    """Search Open Library and upsert results into the local catalog.

    Lets the catalog grow on demand: if a user searches for a book we don't
    have, the frontend calls this and the book (with cover) appears.
    """
    found = await ol.search_books(q)
    out = []
    for data in found:
        if not data["ol_key"]:
            continue
        existing = db.query(models.Book).filter_by(ol_key=data["ol_key"]).first()
        if existing:
            out.append(existing)
            continue
        if genre:
            data["genre"] = genre
        b = models.Book(**data)
        db.add(b)
        out.append(b)
    db.commit()
    return [to_out(b) for b in out]
