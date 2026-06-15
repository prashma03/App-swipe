# App-swipe

A Tinder-style movie discovery app where users swipe left or right to find movies they like.

## Features

- Swipe or tap to pass and like movies
- Discover popular movies from TMDB
- Save liked movies to a personal list
- Undo the most recent swipe
- Continue with demo content when the API is offline

## Tech Stack

- Python
- FastAPI
- TMDB API
- React Native with Expo

## Run the backend

Create a `.env` file at the project root:

```env
TMDB_API_KEY=your_tmdb_api_key
```

Then run:

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

## Run the mobile app

```bash
cd frontend
npm install
npm start
```

The frontend API URL is configured in `frontend/src/config.js`.

- Android emulator: keep `http://10.0.2.2:8000`
- iOS simulator: use `http://localhost:8000`
- Physical phone: use your computer's local network IP, such as `http://192.168.1.10:8000`

## Author

Pronita Ghimire
