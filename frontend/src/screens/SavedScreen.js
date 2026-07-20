import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";

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

const DEFAULT_PARTICIPANTS = ["You", "Friend"];
const SESSION_SECONDS = 60;

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
  const [participants, setParticipants] = useState(DEFAULT_PARTICIPANTS);
  const [participantInput, setParticipantInput] = useState("");
  const [nightActive, setNightActive] = useState(false);
  const [nightMovieIndex, setNightMovieIndex] = useState(0);
  const [nightPersonIndex, setNightPersonIndex] = useState(0);
  const [nightSeconds, setNightSeconds] = useState(SESSION_SECONDS);
  const [nightVotes, setNightVotes] = useState({});
  const [showNightPlan, setShowNightPlan] = useState(false);

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

  const nightMovies = useMemo(() => {
    const unwatched = movies.filter((movie) => !movie.watched);
    return unwatched.length ? unwatched : movies;
  }, [movies]);

  const nightPlan = useMemo(
    () => buildNightPlan(nightMovies, nightVotes, participants),
    [nightMovies, nightVotes, participants]
  );

  useEffect(() => {
    if (!nightActive) return undefined;

    const timer = setInterval(() => {
      setNightSeconds((value) => {
        if (value <= 1) {
          setNightActive(false);
          setShowNightPlan(true);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [nightActive]);

  const addParticipant = () => {
    const nextName = participantInput.trim();
    if (!nextName || participants.some((name) => name.toLowerCase() === nextName.toLowerCase())) {
      return;
    }

    setParticipants((items) => [...items, nextName]);
    setParticipantInput("");
  };

  const removeParticipant = (name) => {
    setParticipants((items) =>
      items.length <= 1 ? items : items.filter((item) => item !== name)
    );
  };

  const startNightSession = () => {
    setNightVotes({});
    setNightMovieIndex(0);
    setNightPersonIndex(0);
    setNightSeconds(SESSION_SECONDS);
    setShowNightPlan(false);
    setNightActive(true);
  };

  const resetNightSession = () => {
    setNightVotes({});
    setNightMovieIndex(0);
    setNightPersonIndex(0);
    setNightSeconds(SESSION_SECONDS);
    setNightActive(false);
    setShowNightPlan(false);
  };

  const finishNightSession = () => {
    setNightActive(false);
    setShowNightPlan(true);
  };

  const recordNightVote = (voteType) => {
    const movie = nightMovies[nightMovieIndex];
    const person = participants[nightPersonIndex];
    if (!movie || !person) return;

    setNightVotes((items) => {
      const movieVotes = items[movie.id] || { likes: [], passes: [], vetos: [] };
      const nextVotes = {
        likes: movieVotes.likes.filter((name) => name !== person),
        passes: movieVotes.passes.filter((name) => name !== person),
        vetos: movieVotes.vetos.filter((name) => name !== person),
      };
      nextVotes[voteType] = [...nextVotes[voteType], person];
      return { ...items, [movie.id]: nextVotes };
    });

    advanceNightStep();
  };

  const advanceNightStep = () => {
    const lastMovie = nightMovieIndex >= nightMovies.length - 1;
    const lastPerson = nightPersonIndex >= participants.length - 1;

    if (lastMovie && lastPerson) {
      finishNightSession();
      return;
    }

    if (lastMovie) {
      setNightMovieIndex(0);
      setNightPersonIndex((value) => value + 1);
      return;
    }

    setNightMovieIndex((value) => value + 1);
  };

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

          <MovieNightPanel
            compact={compact}
            currentMovie={nightMovies[nightMovieIndex]}
            currentParticipant={participants[nightPersonIndex]}
            movies={nightMovies}
            onAddParticipant={addParticipant}
            onFinish={finishNightSession}
            onOpenMovie={(movie) => setDetailMovie(movie)}
            onRecordVote={recordNightVote}
            onRemoveParticipant={removeParticipant}
            onReset={resetNightSession}
            onStart={startNightSession}
            participantInput={participantInput}
            participants={participants}
            plan={nightPlan}
            progressLabel={`${nightMovieIndex + 1}/${nightMovies.length}`}
            secondsLeft={nightSeconds}
            sessionActive={nightActive}
            setParticipantInput={setParticipantInput}
            showPlan={showNightPlan}
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

function MovieNightPanel({
  compact,
  currentMovie,
  currentParticipant,
  movies,
  onAddParticipant,
  onFinish,
  onOpenMovie,
  onRecordVote,
  onRemoveParticipant,
  onReset,
  onStart,
  participantInput,
  participants,
  plan,
  progressLabel,
  secondsLeft,
  sessionActive,
  setParticipantInput,
  showPlan,
}) {
  const canStart = movies.length > 0 && participants.length > 0;

  if (sessionActive && currentMovie) {
    return (
      <View style={[styles.nightPanel, compact && styles.nightPanelCompact]}>
        <View style={styles.nightHeader}>
          <View>
            <Text style={styles.nightKicker}>GROUP MOVIE NIGHT</Text>
            <Text style={styles.nightTitle}>{currentParticipant}'s turn</Text>
          </View>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>{secondsLeft}s</Text>
          </View>
        </View>

        <Pressable onPress={() => onOpenMovie(currentMovie)} style={styles.voteCard}>
          <View style={styles.votePoster}>
            {getMoviePoster(currentMovie) ? (
              <Image source={{ uri: getMoviePoster(currentMovie) }} style={styles.votePosterImage} />
            ) : (
              <Text style={styles.votePosterText}>FILM</Text>
            )}
          </View>
          <View style={styles.voteCopy}>
            <Text numberOfLines={1} style={styles.voteTitle}>
              {currentMovie.title || "Untitled film"}
            </Text>
            <Text style={styles.voteMeta}>
              {progressLabel} / {Number(currentMovie.vote_average || 0).toFixed(1)}
            </Text>
            <Text numberOfLines={2} style={styles.voteOverview}>
              {currentMovie.overview || "Open the card for details before you vote."}
            </Text>
          </View>
        </Pressable>

        <View style={styles.voteActions}>
          <Pressable onPress={() => onRecordVote("vetos")} style={[styles.voteButton, styles.vetoButton]}>
            <Text style={styles.voteButtonText}>Veto</Text>
          </Pressable>
          <Pressable onPress={() => onRecordVote("passes")} style={styles.voteButton}>
            <Text style={styles.voteButtonText}>Pass</Text>
          </Pressable>
          <Pressable onPress={() => onRecordVote("likes")} style={[styles.voteButton, styles.likeButton]}>
            <Text style={styles.voteButtonText}>Like</Text>
          </Pressable>
        </View>

        <Pressable onPress={onFinish} style={styles.finishLink}>
          <Text style={styles.finishText}>Build plan now</Text>
        </Pressable>
      </View>
    );
  }

  if (showPlan && plan.length) {
    return (
      <View style={[styles.nightPanel, compact && styles.nightPanelCompact]}>
        <View style={styles.nightHeader}>
          <View>
            <Text style={styles.nightKicker}>TONIGHT PLAN</Text>
            <Text style={styles.nightTitle}>Four clean choices</Text>
          </View>
          <Pressable onPress={onReset} style={styles.resetButton}>
            <Text style={styles.resetText}>RESET</Text>
          </Pressable>
        </View>

        {plan.map((item) => (
          <Pressable
            key={`${item.slot}-${item.movie.id}`}
            onPress={() => onOpenMovie(item.movie)}
            style={styles.planRow}
          >
            <Text style={styles.planSlot}>{item.slot}</Text>
            <View style={styles.planCopy}>
              <Text numberOfLines={1} style={styles.planTitle}>
                {item.movie.title || "Untitled film"}
              </Text>
              <Text numberOfLines={1} style={styles.planMeta}>
                {item.reason}
              </Text>
            </View>
          </Pressable>
        ))}

        <View style={styles.shareCard}>
          <Text style={styles.shareKicker}>SHARE CARD</Text>
          <Text style={styles.shareTitle}>
            Tonight: {plan[0].movie.title || "Movie night"}
          </Text>
          <Text style={styles.shareBody}>
            Backup: {plan[plan.length - 1].movie.title || "Saved pick"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.nightPanel, compact && styles.nightPanelCompact]}>
      <View style={styles.nightHeader}>
        <View>
          <Text style={styles.nightKicker}>GROUP MOVIE NIGHT</Text>
          <Text style={styles.nightTitle}>Find shared picks</Text>
        </View>
        <Pressable
          disabled={!canStart}
          onPress={onStart}
          style={[styles.startButton, !canStart && styles.startButtonDisabled]}
        >
          <Text style={styles.startText}>START</Text>
        </Pressable>
      </View>

      <Text style={styles.nightBody}>
        Everyone gets a fast pass, like, or veto round. The plan avoids hard no's first.
      </Text>

      <View style={styles.peopleRow}>
        {participants.map((name) => (
          <Pressable
            key={name}
            onLongPress={() => onRemoveParticipant(name)}
            style={styles.personChip}
          >
            <Text style={styles.personText}>{name}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.addPersonRow}>
        <TextInput
          autoCapitalize="words"
          onChangeText={setParticipantInput}
          onSubmitEditing={onAddParticipant}
          placeholder="Add viewer"
          placeholderTextColor="#555B68"
          style={styles.personInput}
          value={participantInput}
        />
        <Pressable onPress={onAddParticipant} style={styles.addPersonButton}>
          <Text style={styles.addPersonText}>ADD</Text>
        </Pressable>
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

function buildNightPlan(movies, votesByMovie, participants) {
  if (!movies.length) return [];

  const scored = movies.map((movie) => {
    const votes = votesByMovie[movie.id] || { likes: [], passes: [], vetos: [] };
    const likes = votes.likes.length;
    const vetos = votes.vetos.length;
    const passes = votes.passes.length;
    const rating = Number(movie.vote_average || 0);
    const popularity = Number(movie.popularity || 0);
    const score = likes * 100 - vetos * 140 - passes * 12 + rating * 8 + popularity * 0.12;

    return { likes, movie, passes, score, vetos };
  });

  const noVeto = scored.filter((item) => item.vetos === 0);
  const decisionPool = noVeto.length ? noVeto : scored;
  const quickPick = pickUnique(decisionPool, [], (item) => item.score);
  const crowdPick = pickUnique(
    decisionPool,
    [quickPick],
    (item) => item.likes * 100 + item.score + sharedBonus(item.likes, participants.length)
  );
  const wildPick = pickUnique(
    scored,
    [quickPick, crowdPick],
    (item) => Number(item.movie.popularity || 0) + item.likes * 20 - item.vetos * 20
  );
  const backupPick = pickUnique(
    scored,
    [quickPick, crowdPick, wildPick],
    (item) => Number(item.movie.vote_average || 0) * 10 - item.vetos * 30
  );

  return [
    buildPlanItem("Quick Pick", quickPick, "Best balance of yes votes and low friction"),
    buildPlanItem("Crowd Pleaser", crowdPick, "Most likely to work for the room"),
    buildPlanItem("Wild Card", wildPick, "A stronger swing if the room wants energy"),
    buildPlanItem("Backup", backupPick, "Keep this ready if the first choice stalls"),
  ].filter(Boolean);
}

function pickUnique(items, usedItems, getScore) {
  const usedIds = usedItems.filter(Boolean).map((item) => item.movie.id);
  const available = items.filter((item) => !usedIds.includes(item.movie.id));
  const pool = available.length ? available : items;
  return [...pool].sort((a, b) => getScore(b) - getScore(a))[0];
}

function sharedBonus(likes, participantCount) {
  if (!participantCount) return 0;
  return likes === participantCount ? 80 : 0;
}

function buildPlanItem(slot, item, reason) {
  if (!item?.movie) return null;

  const voteText = `${item.likes} like${item.likes === 1 ? "" : "s"}, ${item.vetos} veto${item.vetos === 1 ? "" : "es"}`;
  return {
    movie: item.movie,
    reason: `${reason} / ${voteText}`,
    slot,
  };
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
  nightPanel: {
    backgroundColor: "rgba(12, 14, 22, 0.92)",
    borderColor: "rgba(230, 57, 70, 0.24)",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  nightPanelCompact: {
    padding: 12,
  },
  nightHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nightKicker: {
    color: "#E63946",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  nightTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 4,
    textTransform: "uppercase",
  },
  nightBody: {
    color: "#A3A7B0",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 11,
  },
  timerBadge: {
    alignItems: "center",
    backgroundColor: "rgba(230, 57, 70, 0.18)",
    borderColor: "rgba(230, 57, 70, 0.32)",
    borderRadius: 17,
    borderWidth: 1,
    minWidth: 48,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  startButton: {
    backgroundColor: "#E63946",
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  startButtonDisabled: {
    opacity: 0.35,
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  resetButton: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  resetText: {
    color: "#F4A261",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  peopleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },
  personChip: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  personText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  addPersonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  personInput: {
    backgroundColor: "#14171E",
    borderColor: "#282C36",
    borderRadius: 14,
    borderWidth: 1,
    color: "#FFFFFF",
    flex: 1,
    fontSize: 13,
    height: 42,
    paddingHorizontal: 13,
  },
  addPersonButton: {
    alignItems: "center",
    backgroundColor: "rgba(244, 162, 97, 0.16)",
    borderColor: "rgba(244, 162, 97, 0.30)",
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  addPersonText: {
    color: "#F4A261",
    fontSize: 10,
    fontWeight: "900",
  },
  voteCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 13,
    padding: 10,
  },
  votePoster: {
    alignItems: "center",
    backgroundColor: "#10121B",
    borderRadius: 10,
    height: 92,
    justifyContent: "center",
    overflow: "hidden",
    width: 62,
  },
  votePosterImage: {
    height: "100%",
    width: "100%",
  },
  votePosterText: {
    color: "#6C757D",
    fontSize: 8,
    fontWeight: "900",
  },
  voteCopy: {
    flex: 1,
    marginLeft: 12,
  },
  voteTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  voteMeta: {
    color: "#F4A261",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
  },
  voteOverview: {
    color: "#A3A7B0",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 7,
  },
  voteActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  voteButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 11,
  },
  vetoButton: {
    backgroundColor: "rgba(230, 57, 70, 0.22)",
    borderColor: "rgba(230, 57, 70, 0.36)",
  },
  likeButton: {
    backgroundColor: "rgba(46, 204, 113, 0.22)",
    borderColor: "rgba(46, 204, 113, 0.36)",
  },
  voteButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  finishLink: {
    alignItems: "center",
    paddingTop: 12,
  },
  finishText: {
    color: "#F4A261",
    fontSize: 12,
    fontWeight: "900",
  },
  planRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 11,
  },
  planSlot: {
    color: "#F4A261",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    width: 86,
  },
  planCopy: {
    flex: 1,
  },
  planTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  planMeta: {
    color: "#858A96",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  shareCard: {
    backgroundColor: "rgba(244, 162, 97, 0.12)",
    borderColor: "rgba(244, 162, 97, 0.24)",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    padding: 13,
  },
  shareKicker: {
    color: "#F4A261",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  shareTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
  },
  shareBody: {
    color: "#A3A7B0",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
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
