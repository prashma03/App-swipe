import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { MovieCard } from "../components/MovieCard";
import { MovieDetailSheet } from "../components/MovieDetailSheet";

export function DiscoverScreen({
  apiStatus,
  currentIndex,
  isDesktopWeb,
  likedCount,
  loading,
  movies,
  onOpenSaved,
  onEditPreferences,
  onReload,
  onSearchChange,
  onSwipe,
  onUndo,
  preferences,
  searchQuery,
  totalMovies,
  undoDisabled,
}) {
  const { width } = useWindowDimensions();
  const [detailMovie, setDetailMovie] = useState(null);
  const position = useRef(new Animated.ValueXY()).current;
  const currentMovie = movies[currentIndex];
  const nextMovie = movies[currentIndex + 1];
  const thirdMovie = movies[currentIndex + 2];
  const screenWidth = Math.min(width || 390, isDesktopWeb ? 520 : 430);
  const swipeThreshold = screenWidth * 0.24;
  const progress = movies.length ? (currentIndex + 1) / movies.length : 0;

  const rotate = position.x.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: ["-13deg", "0deg", "13deg"],
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [0, swipeThreshold],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const passOpacity = position.x.interpolate({
    inputRange: [-swipeThreshold, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const nextScale = position.x.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: [1, 0.955, 1],
    extrapolate: "clamp",
  });
  const nextTranslateY = position.x.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: [0, 16, 0],
    extrapolate: "clamp",
  });

  const completeSwipe = useCallback((direction) => {
    if (!currentMovie) return;
    const x = direction === "right" ? screenWidth * 1.4 : -screenWidth * 1.4;
    Animated.timing(position, {
      duration: 250,
      toValue: { x, y: -12 },
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      onSwipe(direction);
    });
  }, [currentMovie, onSwipe, position, screenWidth]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy * 0.28 });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > swipeThreshold) {
            completeSwipe("right");
          } else if (gesture.dx < -swipeThreshold) {
            completeSwipe("left");
          } else {
            Animated.spring(position, {
              friction: 5,
              tension: 65,
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [completeSwipe, position, swipeThreshold]
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingLogo}>CINESWIPE</Text>
        <View style={styles.loaderTrack}>
          <LinearGradient
            colors={["#E63946", "#F4A261"]}
            style={styles.loaderFill}
          />
        </View>
        <Text style={styles.loadingSub}>CURATING YOUR CINEMA</Text>
      </View>
    );
  }

  if (!currentMovie && searchQuery?.trim()) {
    return (
      <View style={[styles.screen, isDesktopWeb && styles.screenDesktop]}>
        <View style={[styles.header, isDesktopWeb && styles.headerDesktop]}>
          <View>
            <Text style={[styles.logo, isDesktopWeb && styles.logoDesktop]}>
              Search movies
            </Text>
            <Text style={styles.logoSub}>FIND A TITLE IN YOUR CURRENT STACK</Text>
          </View>
        </View>

        <SearchBox
          onSearchChange={onSearchChange}
          searchQuery={searchQuery}
          totalMovies={totalMovies}
          visibleCount={movies.length}
        />

        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>NO RESULTS</Text>
          <Text style={styles.emptyTitle}>Nothing matched</Text>
          <Text style={styles.emptyBody}>
            Try a shorter title, a year, or clear search to return to the full stack.
          </Text>
          <Pressable onPress={() => onSearchChange("")} style={styles.reloadButton}>
            <Text style={styles.reloadText}>Clear search</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!currentMovie) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>DONE</Text>
        <Text style={styles.emptyTitle}>You caught up</Text>
        <Text style={styles.emptyBody}>
          That was the whole stack. Refresh for another round.
        </Text>
        <Pressable onPress={onReload} style={styles.reloadButton}>
          <Text style={styles.reloadText}>Start over</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, isDesktopWeb && styles.screenDesktop]}>
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={["#E63946", "#F4A261"]}
          style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]}
        />
      </View>

      <View style={[styles.header, isDesktopWeb && styles.headerDesktop]}>
        <View>
          <Text style={[styles.logo, isDesktopWeb && styles.logoDesktop]}>
            Discover movies
          </Text>
          <Text style={styles.logoSub}>SWIPE, SAVE, WATCH LATER</Text>
        </View>
        <Pressable onPress={onOpenSaved} style={styles.watchButton}>
          <Text style={styles.watchButtonText}>LIST</Text>
          {!!likedCount && (
            <View style={styles.watchCount}>
              <Text style={styles.watchCountText}>{likedCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {apiStatus === "demo" && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>Offline mode: showing demo movies</Text>
          <Pressable onPress={onReload}>
            <Text style={styles.statusAction}>Retry</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceChip}>
          {preferences?.genres?.length ? `${preferences.genres.length} genres` : "All genres"}
        </Text>
        <Text style={styles.preferenceChip}>
          {preferences?.minRating ? `${preferences.minRating}+ rating` : "Any rating"}
        </Text>
        <Text style={styles.preferenceChip}>
          {preferences?.sortMode === "topRated"
            ? "Top rated"
            : preferences?.sortMode === "newest"
            ? "Newest"
            : "Popular"}
        </Text>
        <Pressable onPress={onEditPreferences} style={styles.tuneChip}>
          <Text style={styles.tuneText}>Tune</Text>
        </Pressable>
      </View>

      <SearchBox
        onSearchChange={onSearchChange}
        searchQuery={searchQuery}
        totalMovies={totalMovies}
        visibleCount={movies.length}
      />

      <View style={[styles.deck, isDesktopWeb && styles.deckDesktop]}>
        {!!thirdMovie && (
          <View style={styles.thirdCard}>
            <MovieCard movie={thirdMovie} />
          </View>
        )}

        {!!nextMovie && (
          <Animated.View
            style={[
              styles.nextCard,
              {
                transform: [
                  { scale: nextScale },
                  { translateY: nextTranslateY },
                ],
              },
            ]}
          >
            <MovieCard movie={nextMovie} />
          </Animated.View>
        )}

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.activeCard,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
        >
          <MovieCard movie={currentMovie} />
          <Animated.View
            style={[styles.decision, styles.like, { opacity: likeOpacity }]}
          >
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          <Animated.View
            style={[styles.decision, styles.pass, { opacity: passOpacity }]}
          >
            <Text style={styles.passText}>NOPE</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={[styles.actions, isDesktopWeb && styles.actionsDesktop]}>
        <ActionButton
          disabled={undoDisabled}
          label="UNDO"
          onPress={onUndo}
          small
          tone="gold"
        />
        <ActionButton label="NOPE" onPress={() => completeSwipe("left")} tone="red" />
        <ActionButton
          label="INFO"
          onPress={() => setDetailMovie(currentMovie)}
          small
          tone="dark"
        />
        <ActionButton
          label="LIKE"
          onPress={() => completeSwipe("right")}
          tone="green"
        />
      </View>

      <MovieDetailSheet
        movie={detailMovie}
        onClose={() => setDetailMovie(null)}
        onLike={() => {
          setDetailMovie(null);
          completeSwipe("right");
        }}
        onSkip={() => {
          setDetailMovie(null);
          completeSwipe("left");
        }}
      />
    </View>
  );
}

function SearchBox({ onSearchChange, searchQuery, totalMovies, visibleCount }) {
  return (
    <View style={styles.searchWrap}>
      <TextInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        onChangeText={onSearchChange}
        placeholder="Search movies by title, plot, or year"
        placeholderTextColor="#555B68"
        style={styles.searchInput}
        value={searchQuery}
      />
      {!!searchQuery && (
        <Pressable onPress={() => onSearchChange("")} style={styles.clearSearch}>
          <Text style={styles.clearSearchText}>Clear</Text>
        </Pressable>
      )}
      <Text style={styles.searchMeta}>
        Showing {visibleCount} of {totalMovies || visibleCount} movies
      </Text>
    </View>
  );
}

function ActionButton({ disabled, label, onPress, small, tone }) {
  const content = getActionContent(label);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionCol,
        disabled && styles.actionDisabled,
      ]}
    >
      <LinearGradient
        colors={getActionColors(tone)}
        style={[styles.actionButton, small && styles.actionButtonSmall]}
      >
        <Text style={[styles.actionText, small && styles.actionTextSmall]}>
          {content.symbol}
        </Text>
      </LinearGradient>
      <Text style={styles.actionLabel}>{content.label}</Text>
    </Pressable>
  );
}

function getActionContent(label) {
  if (label === "UNDO") return { label: "Undo", symbol: "U" };
  if (label === "NOPE") return { label: "Skip", symbol: "X" };
  if (label === "INFO") return { label: "Info", symbol: "i" };
  if (label === "LIKE") return { label: "Save", symbol: "+" };
  return { label, symbol: label };
}

function getActionColors(tone) {
  if (tone === "red") return ["#C0392B", "#E63946"];
  if (tone === "green") return ["#27AE60", "#2ECC71"];
  if (tone === "gold") return ["#1C1C28", "#1C1C28"];
  return ["#171722", "#20202D"];
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenDesktop: {
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 2,
    height: 3,
    left: -18,
    position: "absolute",
    right: -18,
    top: 0,
  },
  progressFill: {
    borderRadius: 2,
    height: 3,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingTop: 13,
  },
  headerDesktop: {
    marginBottom: 18,
  },
  logo: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  logoDesktop: {
    fontSize: 36,
    letterSpacing: -1,
    textTransform: "uppercase",
  },
  logoSub: {
    color: "#6C757D",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: -2,
  },
  watchButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 48,
  },
  watchButtonText: {
    color: "#F4A261",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  watchCount: {
    alignItems: "center",
    backgroundColor: "#E63946",
    borderRadius: 8,
    height: 16,
    justifyContent: "center",
    minWidth: 16,
    position: "absolute",
    right: -3,
    top: -3,
  },
  watchCountText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  statusBanner: {
    alignItems: "center",
    backgroundColor: "rgba(244, 162, 97, 0.12)",
    borderColor: "rgba(244, 162, 97, 0.26)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  statusText: {
    color: "#F4A261",
    fontSize: 12,
    fontWeight: "800",
  },
  statusAction: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  preferenceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 11,
  },
  preferenceChip: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    borderWidth: 1,
    color: "#A3A7B0",
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: "uppercase",
  },
  searchWrap: {
    marginBottom: 13,
  },
  searchInput: {
    backgroundColor: "#14171E",
    borderColor: "#282C36",
    borderRadius: 16,
    borderWidth: 1,
    color: "#FFFFFF",
    fontSize: 14,
    height: 50,
    paddingHorizontal: 15,
    paddingRight: 76,
  },
  clearSearch: {
    alignItems: "center",
    backgroundColor: "rgba(244,162,97,0.14)",
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    position: "absolute",
    right: 8,
    top: 8,
  },
  clearSearchText: {
    color: "#F4A261",
    fontSize: 11,
    fontWeight: "900",
  },
  searchMeta: {
    color: "#6C757D",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 7,
    textTransform: "uppercase",
  },
  tuneChip: {
    backgroundColor: "#E63946",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  tuneText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  deck: { flex: 1, minHeight: 430 },
  deckDesktop: {
    alignSelf: "center",
    flex: 1,
    maxHeight: 660,
    maxWidth: 500,
    minHeight: 520,
    width: "100%",
  },
  thirdCard: {
    bottom: 30,
    left: 20,
    opacity: 0.34,
    position: "absolute",
    right: 20,
    top: 34,
    transform: [{ scale: 0.89 }],
  },
  nextCard: {
    bottom: 20,
    left: 10,
    opacity: 0.62,
    position: "absolute",
    right: 10,
    top: 18,
    transform: [{ scale: 0.955 }, { translateY: 16 }],
  },
  activeCard: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  decision: {
    borderRadius: 8,
    borderWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 7,
    position: "absolute",
    top: 46,
  },
  like: {
    borderColor: "#2ECC71",
    left: 22,
    transform: [{ rotate: "-11deg" }],
  },
  pass: {
    borderColor: "#E63946",
    right: 22,
    transform: [{ rotate: "11deg" }],
  },
  likeText: { color: "#2ECC71", fontSize: 25, fontWeight: "900" },
  passText: { color: "#E63946", fontSize: 25, fontWeight: "900" },
  actions: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    paddingTop: 15,
  },
  actionsDesktop: {
    paddingTop: 20,
  },
  actionCol: {
    alignItems: "center",
  },
  actionDisabled: { opacity: 0.35 },
  actionButton: {
    alignItems: "center",
    borderRadius: 34,
    height: 66,
    justifyContent: "center",
    width: 66,
  },
  actionButtonSmall: {
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    height: 52,
    width: 52,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  actionTextSmall: {
    color: "#F4A261",
    fontSize: 9,
  },
  actionLabel: {
    color: "#6C757D",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 6,
  },
  loading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  loadingLogo: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 3,
  },
  loaderTrack: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    height: 3,
    marginTop: 22,
    overflow: "hidden",
    width: 130,
  },
  loaderFill: { height: 3, width: 86 },
  loadingSub: {
    color: "#6C757D",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 18,
  },
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    color: "#2ECC71",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 16,
  },
  emptyTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "900" },
  emptyBody: {
    color: "#969AA5",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  reloadButton: {
    backgroundColor: "#E63946",
    borderRadius: 24,
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  reloadText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
