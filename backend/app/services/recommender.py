"""Content-based recommendation engine.

Pure functions over plain data — no DB or HTTP here, which keeps it trivially
unit-testable and identical in spirit to the original client-side prototype.

Scoring per candidate, summed over every read/reading book:
    +0.35  same genre
    +0.55  same author
    +0.90 * jaccard(tags)  shared themes
each weighted by (user_rating - 3) / 2, so 5-star books attract similar
titles and 1-2 star books push them away. Unrated reads get weight 0.6.
A small quality prior and preferred-genre bonus round it out.
"""
from dataclasses import dataclass, field

W_GENRE, W_AUTHOR, W_TAGS = 0.35, 0.55, 0.90
PREF_GENRE_BONUS = 0.25
QUALITY_PRIOR = 0.15
MIN_CONTRIB = 0.15  # threshold for a "because you read X" attribution


def jaccard(a: list[str], b: list[str]) -> float:
    sa, sb = set(a), set(b)
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def rating_weight(rating: int | None) -> float:
    return 0.6 if rating is None else (rating - 3) / 2


@dataclass
class Scored:
    book: dict
    score: float = 0.0
    best_contrib: float = 0.0
    best_source: dict | None = None
    best_reasons: list[str] = field(default_factory=list)

    @property
    def reason(self) -> str:
        if not self.best_source or self.best_contrib <= 0.05:
            return "matched: your genres"
        src = self.best_source["title"]
        if "author" in self.best_reasons:
            return f"matched: same author as {src}"
        if "themes" in self.best_reasons:
            return f"matched: themes of {src}"
        return f"matched: genre of {src}"


def score_candidates(candidates: list[dict], liked: list[tuple[dict, float]],
                     pref_genres: list[str]) -> list[Scored]:
    out = []
    for book in candidates:
        s = Scored(book=book)
        for src, weight in liked:
            if src["id"] == book["id"]:
                continue
            part, reasons = 0.0, []
            if src["genre"] == book["genre"]:
                part += W_GENRE; reasons.append("genre")
            if src["author"] == book["author"]:
                part += W_AUTHOR; reasons.append("author")
            sim = jaccard(src["tags"], book["tags"])
            if sim > 0:
                part += sim * W_TAGS; reasons.append("themes")
            contrib = part * weight
            s.score += contrib
            if contrib > s.best_contrib:
                s.best_contrib, s.best_source, s.best_reasons = contrib, src, reasons
        if book["genre"] in pref_genres:
            s.score += PREF_GENRE_BONUS
        s.score += (book.get("rating", 3.8) - 3.5) * QUALITY_PRIOR
        out.append(s)
    out.sort(key=lambda x: x.score, reverse=True)
    return out


def build_rows(scored: list[Scored], pref_genres: list[str]) -> list[dict]:
    """Assemble Netflix-style rows; each book appears in at most one row."""
    used: set[int] = set()

    def take(items, n):
        picked = []
        for c in items:
            if len(picked) >= n:
                break
            if c.book["id"] not in used:
                picked.append(c); used.add(c.book["id"])
        return picked

    rows = []

    by_source: dict[int, list[Scored]] = {}
    for c in scored:
        if c.best_source and c.best_contrib > MIN_CONTRIB:
            by_source.setdefault(c.best_source["id"], []).append(c)
    for src_id, items in sorted(by_source.items(), key=lambda kv: -len(kv[1]))[:2]:
        src = items[0].best_source
        picks = take(items, 6)
        if len(picks) >= 2:
            rows.append({"key": f"src{src_id}", "title": f"Because you read {src['title']}", "items": picks})

    top = take([c for c in scored if c.score > 0.1], 8)
    if len(top) >= 2:
        rows.append({"key": "top", "title": "Your top matches", "items": top})

    for g in pref_genres[:2]:
        picks = take([c for c in scored if c.book["genre"] == g], 6)
        if len(picks) >= 2:
            rows.append({"key": f"g-{g}", "title": f"More {g}", "items": picks})

    outside = take([c for c in scored
                    if c.book["genre"] not in pref_genres and "themes" in c.best_reasons], 6)
    if len(outside) >= 2:
        rows.append({"key": "outside", "title": "Step slightly outside", "items": outside})

    return rows
