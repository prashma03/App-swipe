# CineSwipe

A Tinder-style movie discovery app where users swipe left or right to find movies they like.

## Features

- Swipe or tap to pass and like movies
- Discover popular movies from TMDB
- Save liked movies to a personal list
- Pick a movie night recommendation from saved films by mood
- Undo the most recent swipe
- Continue browsing starter picks when the API is offline

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

```powershell
uv venv .venv
uv pip install --python .venv\Scripts\python.exe -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0
```

## Run the mobile app

```bash
cd frontend
npm install
npm start
```

## Deploy the web app

The Expo web build is configured for Vercel and Netlify.

Vercel:

- Build command: `cd frontend && npm ci && npx expo export --platform web --output-dir dist`
- Output directory: `frontend/dist`

Netlify:

- Build command: `cd frontend && npm ci && npx expo export --platform web --output-dir dist`
- Publish directory: `frontend/dist`

Both hosts use the checked-in config files for single-page app routing.

For Expo Go on a physical phone, keep the phone and computer on the same Wi-Fi.
The app automatically detects the computer's current network address, so no IP
address needs to be edited when changing networks. Run this from `frontend`:

```bash
npx expo start --lan --clear
```

Then scan the QR code with Expo Go. Start the backend with `--host 0.0.0.0` as
shown above. For use when the phone and computer are on different networks,
deploy the backend and set its public URL as `EXPO_PUBLIC_API_URL`.

## Author

Pronita Ghimire
