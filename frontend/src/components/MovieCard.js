import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, View } from "react-native";

import { TMDB_IMAGE_BASE_URL } from "../config";

export const GENRES = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  53: "Thriller",
  80: "Crime",
  878: "Sci-Fi",
  9648: "Mystery",
  10749: "Romance",
  10751: "Family",
};

export function getMoviePoster(movie) {
  if (!movie?.poster_path) return null;
  return `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`;
}

export function getMovieBackdrop(movie) {
  if (movie?.backdrop_path) return `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`;
  return getMoviePoster(movie);
}

export function getMovieGenres(movie, limit = 3) {
  return (movie?.genre_ids || [])
    .slice(0, limit)
    .map((genreId) => GENRES[genreId])
    .filter(Boolean);
}

export function MovieCard({ movie }) {
  const year = movie.release_date?.slice(0, 4) || "Soon";
  const genres = getMovieGenres(movie, 3);
  const poster = getMoviePoster(movie);

  return (
    <View style={styles.card}>
      {poster ? (
        <Image source={{ uri: poster }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No Poster</Text>
        </View>
      )}

      <LinearGradient
        colors={[
          "rgba(0,0,0,0.08)",
          "transparent",
          "rgba(0,0,0,0.66)",
          "#0A0A0F",
        ]}
        locations={[0, 0.34, 0.7, 1]}
        style={styles.gradient}
      />

      <View style={styles.ratingBadge}>
        <Text style={styles.ratingStar}>STAR</Text>
        <Text style={styles.ratingText}>
          {Number(movie.vote_average || 0).toFixed(1)}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.genreRow}>
          {genres.map((genre) => (
            <Text key={genre} style={styles.genre}>
              {genre.toUpperCase()}
            </Text>
          ))}
        </View>

        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{year}</Text>
          <Text style={styles.dot}>/</Text>
          <Text style={styles.meta}>
            {Math.round(Number(movie.popularity || 0)) || "Fresh"} buzz
          </Text>
        </View>

        <Text numberOfLines={3} style={styles.overview}>
          {movie.overview || "No synopsis is available yet."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#15151F",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    borderWidth: 1,
    bottom: 0,
    elevation: 14,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.55,
    shadowRadius: 35,
    top: 0,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: "#1C1C28",
    flex: 1,
    justifyContent: "center",
  },
  placeholderText: {
    color: "#6C757D",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  gradient: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  ratingBadge: {
    alignItems: "center",
    backgroundColor: "rgba(10, 10, 15, 0.76)",
    borderColor: "rgba(244, 162, 97, 0.26)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 11,
    paddingVertical: 7,
    position: "absolute",
    right: 18,
    top: 18,
  },
  ratingStar: {
    color: "#F4A261",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginRight: 6,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  details: {
    bottom: 0,
    left: 0,
    padding: 22,
    position: "absolute",
    right: 0,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  genre: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 5,
    borderWidth: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.9,
    lineHeight: 37,
    textTransform: "uppercase",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 8,
  },
  meta: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  dot: {
    color: "#F4A261",
    marginHorizontal: 10,
  },
  overview: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 11,
  },
});
