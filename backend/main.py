from fastapi import FastAPI
from tmdb_client import get_popular_movies
app = FastAPI()

@app.get("/")
def home():
    return {"message": "Movie Swipe App is running"}
@app.get("/movies/discover")
def discover_movies():
    movies = get_popular_movies()
    return movies