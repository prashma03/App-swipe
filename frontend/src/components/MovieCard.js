import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, View } from "react-native";

import { TMDB_IMAGE_BASE_URL } from "../config";

const GENRES = {
  12: "Adventure",
  16: "Animation",
  18: "Drama",
  28: "Action",
  35: "Comedy",
  53: "Thriller",
  878: "Sci-Fi",
  10749: "Romance",
  10751: "Family",
};

export function MovieCard({ movie }) {
  const year = movie.release_date?.slice(0, 4) || "Coming soon";
  const genres = (movie.genre_ids || [])
    .slice(0, 2)
    .map((genreId) => GENRES[genreId])
    .filter(Boolean)
    .join("  •  ");

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` }}
        style={styles.image}
      />
      <LinearGradient
        colors={["transparent", "rgba(7, 8, 12, 0.2)", "#08090D"]}
        locations={[0.35, 0.55, 1]}
        style={styles.gradient}
      />

      <View style={styles.badge}>
        <Text style={styles.badgeStar}>★</Text>
        <Text style={styles.badgeText}>
          {Number(movie.vote_average || 0).toFixed(1)}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.metaRow}>
          <Text style={styles.year}>{year}</Text>
          {!!genres && <Text style={styles.genres}>{genres}</Text>}
        </View>
        <Text style={styles.title}>{movie.title}</Text>
        <Text numberOfLines={3} style={styles.overview}>
          {movie.overview || "No synopsis is available yet."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#151820",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 30,
    borderWidth: 1,
    bottom: 0,
    elevation: 12,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.42,
    shadowRadius: 25,
    top: 0,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  gradient: {
    bottom: 0,
    height: "62%",
    left: 0,
    position: "absolute",
    right: 0,
  },
  badge: {
    alignItems: "center",
    backgroundColor: "rgba(10, 11, 15, 0.74)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 7,
    position: "absolute",
    right: 18,
    top: 18,
  },
  badgeStar: {
    color: "#FFD166",
    fontSize: 13,
    marginRight: 5,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  details: {
    bottom: 0,
    left: 0,
    padding: 24,
    position: "absolute",
    right: 0,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  year: {
    backgroundColor: "#FF4F75",
    borderRadius: 7,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  genres: {
    color: "#C8CBD3",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.7,
    lineHeight: 34,
  },
  overview: {
    color: "#B9BCC6",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
  },
});
