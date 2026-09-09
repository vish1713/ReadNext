# ReadNext — what to read next

Content-based book recommendations with real covers from Open Library.



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


