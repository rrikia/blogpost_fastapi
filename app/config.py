from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Production (Render + Neon): set DATABASE_URL to the full connection string.
    # Local development: leave DATABASE_URL unset and use the separate fields.
    DATABASE_URL: str | None = None
    DATABASE_HOSTNAME: str = "localhost"
    DATABASE_PORT: str = "5432"
    DATABASE_USERNAME: str = "postgres"
    DATABASE_PASSWORD: str = ""
    DATABASE_NAME: str = "fastapi"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Comma-separated list of frontend origins allowed to call the API,
    # e.g. "http://localhost:5173,https://my-frontend.pages.dev"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            # Some providers hand out "postgres://", which SQLAlchemy no longer accepts
            return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
        return (
            f"postgresql://{self.DATABASE_USERNAME}:{self.DATABASE_PASSWORD}"
            f"@{self.DATABASE_HOSTNAME}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
