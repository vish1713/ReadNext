# ReadNext — what to read next

Content-based book recommendations with real covers from Open Library.


## Layout

    backend/
      app/
        main.py                  FastAPI app: CORS, routers, table creation
        config.py                settings (DATABASE_URL, CORS) via env/.env
        database.py              engine + session
        models.py                Book, ShelfEntry, Dismissal, Preference
        schemas.py               Pydantic request/response shapes
        seed.py                  one-shot catalog import from Open Library
        routers/
          books.py               list/search/detail + POST /books/import
          shelf.py               shelf CRUD, dismissals, genre preferences
          recommendations.py     GET /recommendations → rows with reasons
        services/
          openlibrary.py         external API client (all HTTP lives here)
          recommender.py         pure scoring engine (unit-testable)
    frontend/
      src/
        api.js                   all fetch calls (components never fetch)
        theme.js                 design tokens
        components/              Cover (real image + fallback), BookCard, BookModal, StarRating
        views/                   Onboarding, Discover, Shelf, SearchResults
        App.jsx                  state + routing between views

## Run it

Backend (Python 3.11+):

    cd backend
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    python -m app.seed          # pulls ~200 books + covers from Open Library
    uvicorn app.main:app --reload --port 8000

Frontend (Node 18+):

    cd frontend
    npm install
    npm run dev                 # http://localhost:5173 (proxies /api → :8000)

## How recommendations work

For every unshelved, undismissed book, sum over each read/reading book:
genre match (+0.35), same author (+0.55), Jaccard tag similarity (×0.90) —
each weighted by (your rating − 3) / 2, so 5★ attracts and 1★ repels.
Add a preferred-genre bonus and a small quality prior, then assemble rows:
"Because you read X", top matches, favorite genres, and a serendipity row.
Every card shows the actual reason it was picked.


