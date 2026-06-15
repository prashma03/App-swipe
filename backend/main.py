from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .tmdb_client import get_popular_movies

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Movie Swipe App is running"}


@app.get("/movies/discover")
def discover_movies():
    movies = get_popular_movies()
    return movies
