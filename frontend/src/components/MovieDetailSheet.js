import { LinearGradient } from "expo-linear-gradient";
import {
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getMovieBackdrop, getMovieGenres } from "./MovieCard";

export function MovieDetailSheet({
  movie,
  onClose,
  onLike,
  onSkip,
  onToggleWatched,
  watched,
}) {
  if (!movie) return null;

  const genres = getMovieGenres(movie, 4);
  const backdrop = getMovieBackdrop(movie);
  const year = movie.release_date?.slice(0, 4) || "Upcoming";
  const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${movie.title} trailer`
  )}`;

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.modalBackdrop}>
        <Pressable style={styles.detailCard}>
          <View style={styles.handle} />
          <ImageBackground source={{ uri: backdrop }} style={styles.detailBanner}>
            <LinearGradient
              colors={["transparent", "#12121A"]}
              style={styles.detailBannerFade}
            />
          </ImageBackground>

          <ScrollView
            contentContainerStyle={styles.detailContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.genreRow}>
              {genres.map((genre) => (
                <Text key={genre} style={styles.detailGenre}>
                  {genre.toUpperCase()}
                </Text>
              ))}
            </View>

            <Text style={styles.detailTitle}>{movie.title}</Text>
            <Text style={styles.reason}>
              Picked because it has strong audience buzz, a clean poster read,
              and fits quick discovery browsing.
            </Text>

            <View style={styles.statsRow}>
              <Stat label="Rating" value={Number(movie.vote_average || 0).toFixed(1)} />
              <Stat label="Year" value={year} />
              <Stat label="Votes" value={String(movie.vote_count || "New")} />
              <Stat label="Buzz" value={String(Math.round(movie.popularity || 0))} />
            </View>

            <Text style={styles.detailOverview}>
              {movie.overview || "No synopsis is available yet."}
            </Text>

            <View style={styles.detailActions}>
              <Pressable
                onPress={() => Linking.openURL(trailerUrl)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryText}>Trailer</Text>
              </Pressable>
              {onToggleWatched && (
                <Pressable onPress={onToggleWatched} style={styles.secondaryButton}>
                  <Text style={styles.secondaryText}>
                    {watched ? "Unwatch" : "Watched"}
                  </Text>
                </Pressable>
              )}
            </View>

            {(onSkip || onLike) && (
              <View style={styles.detailActions}>
                {onSkip && (
                  <Pressable onPress={onSkip} style={styles.detailSkip}>
                    <Text style={styles.detailSkipText}>Skip</Text>
                  </Pressable>
                )}
                {onLike && (
                  <Pressable onPress={onLike} style={styles.detailLike}>
                    <Text style={styles.detailLikeText}>Add to My List</Text>
                  </Pressable>
                )}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.72)",
    flex: 1,
    justifyContent: "flex-end",
  },
  detailCard: {
    backgroundColor: "#12121A",
    borderColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    maxHeight: "86%",
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 3,
    height: 5,
    marginTop: 12,
    position: "absolute",
    width: 42,
    zIndex: 2,
  },
  detailBanner: {
    height: 220,
    justifyContent: "flex-end",
  },
  detailBannerFade: {
    bottom: 0,
    height: 120,
    left: 0,
    position: "absolute",
    right: 0,
  },
  detailContent: {
    paddingBottom: 34,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  detailGenre: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 5,
    color: "rgba(255,255,255,0.72)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 38,
    marginTop: 13,
    textTransform: "uppercase",
  },
  reason: {
    color: "#F4A261",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 9,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 17,
    marginTop: 16,
  },
  stat: { minWidth: 60 },
  statLabel: {
    color: "#6C757D",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  statValue: {
    color: "#F4A261",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  detailOverview: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 23,
    marginTop: 20,
  },
  detailActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  secondaryText: { color: "#F4A261", fontWeight: "900" },
  detailSkip: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  detailSkipText: { color: "#FFFFFF", fontWeight: "800" },
  detailLike: {
    alignItems: "center",
    backgroundColor: "#2ECC71",
    borderRadius: 14,
    flex: 1.35,
    paddingVertical: 14,
  },
  detailLikeText: { color: "#FFFFFF", fontWeight: "900" },
});
