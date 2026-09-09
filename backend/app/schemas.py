from pydantic import BaseModel, Field


class BookOut(BaseModel):
    id: int
    ol_key: str
    title: str
    author: str
    genre: str
    year: int | None
    rating: float
    cover_id: int | None
    tags: list[str]
    cover_url: str | None = None          # filled by router
    shelf_status: str | None = None       # want | reading | read
    user_rating: int | None = None

    class Config:
        from_attributes = True


class ShelfUpdate(BaseModel):
    status: str | None = Field(default=None, pattern="^(want|reading|read)$")
    rating: int | None = Field(default=None, ge=1, le=5)


class PreferencesIn(BaseModel):
    genres: list[str]


class RecommendationItem(BaseModel):
    book: BookOut
    score: float
    reason: str


class RecommendationRow(BaseModel):
    key: str
    title: str
    items: list[RecommendationItem]
