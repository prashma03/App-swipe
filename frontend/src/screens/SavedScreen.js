import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { TMDB_IMAGE_BASE_URL } from "../config";

export function SavedScreen({ movies, onDiscover, onRemove }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
      <Text style={styles.heading}>My list</Text>
      <Text style={styles.subheading}>
        {movies.length} {movies.length === 1 ? "movie" : "movies"} saved for later
      </Text>

      {movies.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyHeart}>
            <Text style={styles.emptyHeartText}>♡</Text>
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyBody}>
            Swipe right on something that looks good and it will appear here.
          </Text>
          <Pressable onPress={onDiscover} style={styles.discoverButton}>
            <Text style={styles.discoverText}>Discover movies</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {movies.map((movie) => (
            <View key={movie.id} style={styles.row}>
              <Image
                source={{ uri: `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` }}
                style={styles.poster}
              />
              <View style={styles.info}>
                <Text numberOfLines={2} style={styles.title}>
                  {movie.title}
                </Text>
                <Text style={styles.meta}>
                  {movie.release_date?.slice(0, 4) || "Upcoming"}  •  ★{" "}
                  {Number(movie.vote_average || 0).toFixed(1)}
                </Text>
                <Text numberOfLines={2} style={styles.overview}>
                  {movie.overview}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={`Remove ${movie.title}`}
                onPress={() => onRemove(movie.id)}
                style={styles.remove}
              >
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          ))}
          <View style={styles.bottomSpace} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  eyebrow: {
    color: "#FF4F75",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: 3,
  },
  subheading: { color: "#777C88", fontSize: 13, marginTop: 5 },
  list: { paddingTop: 22 },
  row: {
    alignItems: "center",
    backgroundColor: "#14171E",
    borderColor: "#222631",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    padding: 10,
  },
  poster: {
    backgroundColor: "#232731",
    borderRadius: 12,
    height: 108,
    width: 72,
  },
  info: { flex: 1, marginLeft: 13 },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  meta: { color: "#FFB85C", fontSize: 11, fontWeight: "700", marginTop: 5 },
  overview: { color: "#858A96", fontSize: 11, lineHeight: 16, marginTop: 7 },
  remove: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    marginLeft: 5,
    width: 32,
  },
  removeText: { color: "#676C78", fontSize: 25, fontWeight: "300" },
  bottomSpace: { height: 95 },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyHeart: {
    alignItems: "center",
    backgroundColor: "#171A22",
    borderRadius: 42,
    height: 84,
    justifyContent: "center",
    marginBottom: 20,
    width: 84,
  },
  emptyHeartText: { color: "#FF4F75", fontSize: 41 },
  emptyTitle: { color: "#FFFFFF", fontSize: 23, fontWeight: "800" },
  emptyBody: {
    color: "#858A96",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
    textAlign: "center",
  },
  discoverButton: {
    backgroundColor: "#FF4F75",
    borderRadius: 24,
    marginTop: 24,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  discoverText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
