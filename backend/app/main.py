from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import books, recommendations, shelf

Base.metadata.create_all(engine)

app = FastAPI(title="Spineward API", version="1.0.0",
              description="What-to-read-next: catalog, shelf and content-based recommendations.")

app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins,
                   allow_methods=["*"], allow_headers=["*"])

app.include_router(books.router)
app.include_router(shelf.router)
app.include_router(recommendations.router)


@app.get("/health")
def health():
    return {"ok": True}
