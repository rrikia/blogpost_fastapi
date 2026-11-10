from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import auth, comments, posts, users, votes

app = FastAPI(
    title="BlogPost API",
    description="Posts, votes and comments with JWT authentication.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(votes.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "docs": "/docs"}
