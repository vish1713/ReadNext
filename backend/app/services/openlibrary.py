"""Thin async client for the Open Library API.

Why Open Library: the Goodreads public API was shut down in 2020 and issues no
new keys, so Open Library (free, no key, includes cover images) is the
practical choice. Google Books is a drop-in alternative if you ever need it —
only this file would change.
"""
import httpx

from ..config import settings

# Map our display genres to Open Library subject slugs
GENRE_SUBJECTS = {
    "Fantasy": "fantasy",
    "Sci-Fi": "science_fiction",
    "Mystery": "detective_and_mystery_stories",
    "Romance": "romance",
    "Literary": "literary_fiction",
    "Nonfiction": "biography",
    "Historical": "historical_fiction",
    "Horror": "horror",
}

_MAX_TAGS = 8


def _norm_tags(subjects: list[str]) -> list[str]:
    """Normalize OL subject strings into compact lowercase tags."""
    seen, out = set(), []
    for s in subjects or []:
        t = s.strip().lower().replace(" ", "-")
        if 2 < len(t) <= 30 and t not in seen:
            seen.add(t)
            out.append(t)
        if len(out) >= _MAX_TAGS:
            break
    return out


def cover_url(cover_id: int | None, size: str = "M") -> str | None:
    if not cover_id:
        return None
    return f"{settings.covers_base}/b/id/{cover_id}-{size}.jpg"


async def fetch_subject_books(genre: str, limit: int = 20) -> list[dict]:
    """Top works for a subject, shaped for our Book model."""
    subject = GENRE_SUBJECTS.get(genre)
    if not subject:
        return []
    url = f"{settings.openlibrary_base}/subjects/{subject}.json"
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url, params={"limit": limit})
        r.raise_for_status()
        data = r.json()
    books = []
    for w in data.get("works", []):
        books.append({
            "ol_key": w.get("key", ""),
            "title": w.get("title", "Untitled"),
            "author": (w.get("authors") or [{}])[0].get("name", "Unknown"),
            "genre": genre,
            "year": w.get("first_publish_year"),
            "cover_id": w.get("cover_id"),
            "tags": _norm_tags(w.get("subject", [])),
        })
    return books


async def search_books(query: str, limit: int = 10) -> list[dict]:
    """Full-text search, used by POST /books/import so any book can join the catalog."""
    url = f"{settings.openlibrary_base}/search.json"
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url, params={"q": query, "limit": limit,
                                          "fields": "key,title,author_name,first_publish_year,cover_i,subject,ratings_average"})
        r.raise_for_status()
        data = r.json()
    books = []
    for d in data.get("docs", []):
        books.append({
            "ol_key": d.get("key", ""),
            "title": d.get("title", "Untitled"),
            "author": (d.get("author_name") or ["Unknown"])[0],
            "genre": "Literary",  # caller may override; search results carry no single genre
            "year": d.get("first_publish_year"),
            "cover_id": d.get("cover_i"),
            "rating": round(d.get("ratings_average") or 3.8, 2),
            "tags": _norm_tags(d.get("subject", [])),
        })
    return books
