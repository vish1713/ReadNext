from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """App configuration. Override anything via environment variables or a .env file.

    For a solo deployment SQLite is plenty; set DATABASE_URL to a Postgres DSN
    (e.g. postgresql+psycopg://user:pass@host/db) when you outgrow it.
    """

    database_url: str = "sqlite:///./spineward.db"
    openlibrary_base: str = "https://openlibrary.org"
    covers_base: str = "https://covers.openlibrary.org"
    cors_origins: list[str] = ["http://localhost:5173"]  # Vite dev server

    class Config:
        env_file = ".env"


settings = Settings()
