import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMemo, useState } from "react";

import { getMovieGenres, getMoviePoster } from "../components/MovieCard";
import { MovieDetailSheet } from "../components/MovieDetailSheet";

const SORTS = [
  { id: "saved", label: "Saved" },
  { id: "rating", label: "Rating" },
  { id: "title", label: "Title" },
];

const PICKER_MODES = [
  { id: "crowd", label: "Crowd", title: "Easy group pick" },
  { id: "rating", label: "High Score", title: "Best-rated save" },
  { id: "fresh", label: "Fresh", title: "Newest option" },
  { id: "comfort", label: "Comfort", title: "Light watch" },
  { id: "edge", label: "Edge", title: "Higher intensity" },
];

export function SavedScreen({
  compact,
  movies,
  onDiscover,
  onRemove,
  onToggleWatched,
}) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("saved");
  const [detailMovie, setDetailMovie] = useState(null);
  const [pickerMode, setPickerMode] = useState("crowd");
  const [pickIndex, setPickIndex] = useState(0);

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? movies.filter((movie) =>
          (movie.title || "").toLowerCase().includes(normalizedQuery)
        )
      : movies;

    return [...filtered].sort((a, b) => {
      if (sortMode === "rating") {
        return Number(b.vote_average || 0) - Number(a.vote_average || 0);
      }
      if (sortMode === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });
  }, [movies, query, sortMode]);

  const tonightPick = useMemo(
    () => chooseTonightPick(movies, pickerMode, pickIndex),
    [movies, pickerMode, pickIndex]
  );

  return (
    <View style={[styles.screen, compact && styles.screenCompact]}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View>
          <Text style={[styles.heading, compact && styles.headingCompact]}>
            Watchlist
          </Text>
          <Text style={styles.subheading}>
            {movies.length} {movies.length === 1 ? "film" : "films"} saved
          </Text>
        </View>
        <Pressable onPress={onDiscover} style={styles.discoverButton}>
          <Text style={styles.discoverText}>SWIPE</Text>
        </Pressable>
      </View>

      {movies.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyMark}>
            <Text style={styles.emptyMarkText}>LIST</Text>
          </View>
          <Text style={styles.emptyTitle}>No films yet</Text>
          <Text style={styles.emptyBody}>
            Swipe right on something that looks good and your poster grid will
            start filling up.
          </Text>
          <Pressable onPress={onDiscover} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Discover movies</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <TonightPicker
            compact={compact}
            mode={pickerMode}
            onModeChange={(nextMode) => {
              setPickerMode(nextMode);
              setPickIndex(0);
            }}
            onOpenPick={() => setDetailMovie(tonightPick?.movie)}
            onShuffle={() => setPickIndex((value) => value + 1)}
            pick={tonightPick}
          />

          <TextInput
            autoCapitalize="none"
            onChangeText={setQuery}
            placeholder="Search your watchlist"
            placeholderTextColor="#555B68"
            style={styles.search}
            value={query}
          />

          <View style={styles.sortRow}>
            {SORTS.map((sort) => {
              const selected = sortMode === sort.id;
              return (
                <Pressable
                  key={sort.id}
                  onPress={() => setSortMode(sort.id)}
                  style={[styles.sortChip, selected && styles.sortChipActive]}
                >
                  <Text style={[styles.sortText, selected && styles.sortTextActive]}>
                    {sort.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <FlatList
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            data={visibleMovies}
            keyExtractor={(movie) => String(movie.id)}
            ListEmptyComponent={
              <View style={styles.noResults}>
                <Text style={styles.noResultsTitle}>No matches</Text>
                <Text style={styles.noResultsBody}>
                  Try a shorter title or clear the search.
                </Text>
                <Pressable onPress={() => setQuery("")} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear search</Text>
                </Pressable>
              </View>
            }
            key={compact ? "compact-list" : "full-list"}
            numColumns={compact ? 2 : 3}
            renderItem={({ item }) => (
              <WatchlistTile
                compact={compact}
                movie={item}
                onOpen={() => setDetailMovie(item)}
                onRemove={() => onRemove(item.id)}
                onToggleWatched={() => onToggleWatched(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      <MovieDetailSheet
        movie={detailMovie}
        onClose={() => setDetailMovie(null)}
        onToggleWatched={() => {
          onToggleWatched(detailMovie.id);
          setDetailMovie((movie) => ({ ...movie, watched: !movie.watched }));
        }}
        watched={!!detailMovie?.watched}
      />
    </View>
  );
}

function TonightPicker({
  compact,
  mode,
  onModeChange,
  onOpenPick,
  onShuffle,
  pick,
}) {
  if (!pick?.movie) return null;

  const title = pick.movie.title || "Untitled film";
  const year = pick.movie.release_date?.slice(0, 4) || "Soon";

  return (
    <View style={[styles.picker, compact && styles.pickerCompact]}>
      <View style={styles.pickerHeader}>
        <View>
          <Text style={styles.pickerKicker}>TONIGHT PICKER</Text>
          <Text
            numberOfLines={compact ? 2 : 1}
            style={[styles.pickerTitle, compact && styles.pickerTitleCompact]}
          >
            {pick.modeTitle}
          </Text>
        </View>
        <Pressable onPress={onShuffle} style={styles.spinButton}>
          <Text style={styles.spinText}>SPIN</Text>
        </Pressable>
      </View>

      <Pressable onPress={onOpenPick} style={styles.pickRow}>
        <View style={styles.pickPoster}>
          {getMoviePoster(pick.movie) ? (
            <Image source={{ uri: getMoviePoster(pick.movie) }} style={styles.pickImage} />
          ) : (
            <Text style={styles.pickPosterText}>FILM</Text>
          )}
        </View>
        <View style={styles.pickCopy}>
          <Text numberOfLines={1} style={styles.pickTitle}>{title}</Text>
          <Text style={styles.pickMeta}>
            {year} / {Number(pick.movie.vote_average || 0).toFixed(1)}
          </Text>
          <Text numberOfLines={2} style={styles.pickReason}>{pick.reason}</Text>
        </View>
      </Pressable>

      <View style={styles.modeRow}>
        {PICKER_MODES.map((item) => {
          const selected = mode === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onModeChange(item.id)}
              style={[styles.modeChip, selected && styles.modeChipActive]}
            >
              <Text style={[styles.modeText, selected && styles.modeTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function WatchlistTile({
  compact,
  movie,
  onOpen,
  onRemove,
  onToggleWatched,
}) {
  const poster = getMoviePoster(movie);
  const title = movie.title || "Untitled film";

  return (
    <Pressable
      onLongPress={onRemove}
      onPress={onOpen}
      style={[styles.tileWrap, compact && styles.tileWrapCompact]}
    >
      <View style={styles.tile}>
        {poster ? (
          <Image source={{ uri: poster }} style={styles.tileImage} />
        ) : (
          <View style={styles.tilePlaceholder}>
            <Text style={styles.tilePlaceholderText}>No Poster</Text>
          </View>
        )}
        <View style={styles.tileFade} />
        {movie.watched && (
          <View style={styles.watchedBadge}>
            <Text style={styles.watchedText}>WATCHED</Text>
          </View>
        )}
        <Text numberOfLines={2} style={styles.tileTitle}>
          {title}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={`Mark ${title} watched`}
        onPress={onToggleWatched}
        style={styles.watchedToggle}
      >
        <Text style={styles.watchedToggleText}>
          {movie.watched ? "YES" : "NEW"}
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel={`Remove ${title}`}
        onPress={onRemove}
        style={styles.remove}
      >
        <Text style={styles.removeText}>x</Text>
      </Pressable>
    </Pressable>
  );
}

function chooseTonightPick(movies, mode, pickIndex) {
  const candidates = movies.filter((movie) => !movie.watched);
  const pool = candidates.length ? candidates : movies;
  if (!pool.length) return null;

  if (mode === "fresh") {
    const movie = rankMovies(pool, (item) => Date.parse(item.release_date || "0") || 0, pickIndex);
    return buildPick(movie, "Newest option", "Saved recently enough to still feel fresh.");
  }

  if (mode === "rating") {
    const movie = rankMovies(pool, (item) => Number(item.vote_average || 0), pickIndex);
    return buildPick(movie, "Best-rated save", "Strong rating makes this the safest bet tonight.");
  }

  if (mode === "comfort") {
    const movie = rankMovies(pool, (item) => moodScore(item, [16, 35, 10749, 10751]), pickIndex);
    return buildPick(movie, "Light watch", "A softer pick from the lighter side of your list.");
  }

  if (mode === "edge") {
    const movie = rankMovies(pool, (item) => moodScore(item, [27, 28, 53, 80, 9648]), pickIndex);
    return buildPick(movie, "Higher intensity", "A sharper choice when you want more pulse.");
  }

  const movie = rankMovies(
    pool,
    (item) => Number(item.vote_average || 0) * 10 + Number(item.popularity || 0),
    pickIndex
  );
  return buildPick(movie, "Easy group pick", "Balanced rating and buzz make it an easy yes.");
}

function rankMovies(movies, getScore, pickIndex) {
  const ranked = [...movies].sort((a, b) => getScore(b) - getScore(a));
  return ranked[pickIndex % ranked.length];
}

function moodScore(movie, genreIds) {
  const genres = movie.genre_ids || [];
  const genreBonus = genres.some((genreId) => genreIds.includes(genreId)) ? 100 : 0;
  return genreBonus + Number(movie.vote_average || 0) * 10 + Number(movie.popularity || 0);
}

function buildPick(movie, modeTitle, reason) {
  const genres = getMovieGenres(movie, 2);
  return {
    movie,
    modeTitle,
    reason: genres.length ? `${reason} ${genres.join(" / ")}.` : reason,
  };
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenCompact: {
    minHeight: 0,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingTop: 13,
  },
  headerCompact: {
    marginBottom: 14,
    paddingTop: 2,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.7,
    textTransform: "uppercase",
  },
  headingCompact: {
    fontSize: 25,
  },
  subheading: {
    color: "#6C757D",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: "uppercase",
  },
  discoverButton: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  discoverText: {
    color: "#F4A261",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  search: {
    backgroundColor: "#14171E",
    borderColor: "#282C36",
    borderRadius: 16,
    borderWidth: 1,
    color: "#FFFFFF",
    fontSize: 14,
    height: 50,
    marginBottom: 11,
    paddingHorizontal: 15,
  },
  picker: {
    backgroundColor: "rgba(20, 22, 34, 0.88)",
    borderColor: "rgba(244, 162, 97, 0.18)",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  pickerCompact: {
    padding: 12,
  },
  pickerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pickerKicker: {
    color: "#F4A261",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  pickerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 4,
    textTransform: "uppercase",
  },
  pickerTitleCompact: {
    fontSize: 15,
    lineHeight: 18,
  },
  spinButton: {
    backgroundColor: "#E63946",
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  spinText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  pickRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 13,
  },
  pickPoster: {
    alignItems: "center",
    backgroundColor: "#10121B",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 10,
    borderWidth: 1,
    height: 76,
    justifyContent: "center",
    overflow: "hidden",
    width: 52,
  },
  pickImage: {
    height: "100%",
    width: "100%",
  },
  pickPosterText: {
    color: "#6C757D",
    fontSize: 8,
    fontWeight: "900",
  },
  pickCopy: {
    flex: 1,
    marginLeft: 12,
  },
  pickTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  pickMeta: {
    color: "#F4A261",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
  },
  pickReason: {
    color: "#A3A7B0",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 13,
  },
  modeChip: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  modeChipActive: {
    backgroundColor: "rgba(244, 162, 97, 0.16)",
    borderColor: "#F4A261",
  },
  modeText: {
    color: "#8F95A0",
    fontSize: 10,
    fontWeight: "900",
  },
  modeTextActive: {
    color: "#F4A261",
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },
  sortChip: {
    alignItems: "center",
    backgroundColor: "#171722",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  sortChipActive: {
    backgroundColor: "rgba(244, 162, 97, 0.16)",
    borderColor: "#F4A261",
  },
  sortText: {
    color: "#8F95A0",
    fontSize: 11,
    fontWeight: "900",
  },
  sortTextActive: {
    color: "#F4A261",
  },
  grid: {
    paddingBottom: 105,
  },
  row: {
    gap: 10,
  },
  tileWrap: {
    aspectRatio: 0.66,
    flex: 1,
    marginBottom: 10,
    maxWidth: "31.5%",
  },
  tileWrapCompact: {
    maxWidth: "48%",
  },
  tile: {
    backgroundColor: "#1C1C28",
    borderRadius: 13,
    flex: 1,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  tileImage: {
    height: "100%",
    position: "absolute",
    width: "100%",
  },
  tilePlaceholder: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 8,
  },
  tilePlaceholderText: {
    color: "#6C757D",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase",
  },
  tileFade: {
    backgroundColor: "rgba(0,0,0,0.42)",
    bottom: 0,
    height: "44%",
    left: 0,
    position: "absolute",
    right: 0,
  },
  watchedBadge: {
    backgroundColor: "rgba(46,204,113,0.92)",
    borderRadius: 8,
    left: 7,
    paddingHorizontal: 6,
    paddingVertical: 4,
    position: "absolute",
    top: 7,
  },
  watchedText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  tileTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 13,
    padding: 8,
    textTransform: "uppercase",
  },
  remove: {
    alignItems: "center",
    backgroundColor: "#E63946",
    borderColor: "#0A0A0F",
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: -5,
    top: -5,
    width: 22,
  },
  watchedToggle: {
    alignItems: "center",
    backgroundColor: "#F4A261",
    borderColor: "#0A0A0F",
    borderRadius: 11,
    borderWidth: 2,
    bottom: -5,
    height: 22,
    justifyContent: "center",
    left: -5,
    position: "absolute",
    width: 28,
  },
  watchedToggleText: {
    color: "#0A0A0F",
    fontSize: 7,
    fontWeight: "900",
  },
  removeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginTop: -1,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyMark: {
    alignItems: "center",
    backgroundColor: "#1C1C28",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 44,
    borderWidth: 1,
    height: 88,
    justifyContent: "center",
    marginBottom: 22,
    width: 88,
  },
  emptyMarkText: {
    color: "#F4A261",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  emptyBody: {
    color: "#858A96",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#E63946",
    borderRadius: 24,
    marginTop: 24,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  emptyButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  noResults: {
    alignItems: "center",
    paddingTop: 70,
    width: "100%",
  },
  noResultsTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  noResultsBody: {
    color: "#858A96",
    fontSize: 13,
    marginTop: 7,
    textAlign: "center",
  },
  clearButton: {
    backgroundColor: "rgba(244, 162, 97, 0.14)",
    borderColor: "rgba(244, 162, 97, 0.24)",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  clearButtonText: {
    color: "#F4A261",
    fontSize: 12,
    fontWeight: "900",
  },
});
