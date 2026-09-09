from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..schemas import RecommendationItem, RecommendationRow
from ..services import openlibrary as ol
from ..services.recommender import build_rows, rating_weight, score_candidates
from .books import to_out

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def _as_dict(b: models.Book) -> dict:
    return {"id": b.id, "title": b.title, "author": b.author, "genre": b.genre,
            "rating": b.rating, "tags": b.tags or []}


@router.get("", response_model=list[RecommendationRow])
def recommendations(db: Session = Depends(get_db)):
    pref_genres = [p.genre for p in db.query(models.Preference).all()]
    entries = db.query(models.ShelfEntry).all()
    dismissed = {d.book_id for d in db.query(models.Dismissal).all()}
    shelved = {e.book_id for e in entries}

    liked = [(_as_dict(e.book), rating_weight(e.rating))
             for e in entries if e.book and e.status in ("read", "reading")]

    candidates = [_as_dict(b) for b in db.query(models.Book).all()
                  if b.id not in shelved and b.id not in dismissed]

    scored = score_candidates(candidates, liked, pref_genres)
    rows = build_rows(scored, pref_genres)

    books_by_id = {b.id: b for b in db.query(models.Book).all()}
    return [
        RecommendationRow(
            key=row["key"], title=row["title"],
            items=[RecommendationItem(book=to_out(books_by_id[c.book["id"]]),
                                      score=round(c.score, 3), reason=c.reason)
                   for c in row["items"]],
        )
        for row in rows
    ]
