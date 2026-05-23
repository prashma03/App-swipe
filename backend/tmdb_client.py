import os
import requests
from dotenv import load_dotenv

load_dotenv(".env")

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"

def get_popular_movies():
    url = f"{BASE_URL}/movie/popular"

    params = {
        "api_key": TMDB_API_KEY,
        "language": "en-US",
        "page": 1
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()

    return data["results"]