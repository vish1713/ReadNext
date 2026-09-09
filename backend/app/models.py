"""SQLAlchemy models.

Single-user by design (solo venture). To go multi-user later, add a User table
and a user_id FK on ShelfEntry / Dismissal — the recommender already takes the
shelf as input, so nothing else changes.
"""
from sqlalchemy import JSON, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    ol_key: Mapped[str] = mapped_column(String, unique=True, index=True)  # e.g. "/works/OL82563W"
    title: Mapped[str] = mapped_column(String, index=True)
    author: Mapped[str] = mapped_column(String, index=True, default="Unknown")
    genre: Mapped[str] = mapped_column(String, index=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=3.8)      # Open Library average, fallback 3.8
    cover_id: Mapped[int | None] = mapped_column(Integer, nullable=True)  # covers.openlibrary.org id
    tags: Mapped[list] = mapped_column(JSON, default=list)          # normalized OL subjects

    shelf_entry = relationship("ShelfEntry", back_populates="book", uselist=False)


class ShelfEntry(Base):
    __tablename__ = "shelf_entries"
    __table_args__ = (UniqueConstraint("book_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String)          # want | reading | read
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1..5

    book = relationship("Book", back_populates="shelf_entry")


class Dismissal(Base):
    __tablename__ = "dismissals"
    __table_args__ = (UniqueConstraint("book_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("books.id", ondelete="CASCADE"), index=True)


class Preference(Base):
    __tablename__ = "preferences"

    id: Mapped[int] = mapped_column(primary_key=True)
    genre: Mapped[str] = mapped_column(String, unique=True)
