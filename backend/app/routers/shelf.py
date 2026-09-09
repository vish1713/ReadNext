from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import BookOut, PreferencesIn, ShelfUpdate
from .books import to_out

router = APIRouter(tags=["shelf"])


@router.get("/shelf", response_model=list[BookOut])
def get_shelf(db: Session = Depends(get_db)):
    entries = db.query(models.ShelfEntry).all()
    return [to_out(e.book, e) for e in entries if e.book]


@router.put("/shelf/{book_id}", response_model=BookOut)
def upsert_entry(book_id: int, body: ShelfUpdate, db: Session = Depends(get_db)):
    if not db.get(models.Book, book_id):
        raise HTTPException(404, "Book not found")
    entry = db.query(models.ShelfEntry).filter_by(book_id=book_id).first()
    if not entry:
        entry = models.ShelfEntry(book_id=book_id, status=body.status or "want")
        db.add(entry)
    if body.status:
        entry.status = body.status
    if body.rating:
        entry.rating = body.rating
        if entry.status == "want":  # rating implies you've read it
            entry.status = "read"
    db.commit()
    db.refresh(entry)
    return to_out(entry.book, entry)


@router.delete("/shelf/{book_id}", status_code=204)
def remove_entry(book_id: int, db: Session = Depends(get_db)):
    db.query(models.ShelfEntry).filter_by(book_id=book_id).delete()
    db.commit()


@router.post("/dismiss/{book_id}", status_code=204)
def dismiss(book_id: int, db: Session = Depends(get_db)):
    if not db.query(models.Dismissal).filter_by(book_id=book_id).first():
        db.add(models.Dismissal(book_id=book_id))
        db.commit()


@router.get("/preferences", response_model=list[str])
def get_preferences(db: Session = Depends(get_db)):
    return [p.genre for p in db.query(models.Preference).all()]


@router.put("/preferences", response_model=list[str])
def set_preferences(body: PreferencesIn, db: Session = Depends(get_db)):
    db.query(models.Preference).delete()
    for g in body.genres:
        db.add(models.Preference(genre=g))
    db.commit()
    return body.genres
