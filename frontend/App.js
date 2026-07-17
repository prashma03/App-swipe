import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { API_BASE_URL } from "./src/config";
import { fallbackMovies } from "./src/data/fallbackMovies";
import { DiscoverScreen } from "./src/screens/DiscoverScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { PreferencesScreen } from "./src/screens/PreferencesScreen";
import { SavedScreen } from "./src/screens/SavedScreen";

const STORAGE_KEY = "movieSwipe.appState.v1";
const DEFAULT_PREFERENCES = {
  genres: [],
  minRating: 0,
  sortMode: "popular",
};

function AppContent() {
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web";
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiStatus, setApiStatus] = useState("idle");
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [toast, setToast] = useState("");
  const [toastOpacity] = useState(new Animated.Value(0));

  const showToast = useCallback(
    (message) => {
      setToast(message);
      Animated.sequence([
        Animated.timing(toastOpacity, {
          duration: 180,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.delay(1700),
        Animated.timing(toastOpacity, {
          duration: 220,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [toastOpacity]
  );

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setApiStatus("loading");
    setCurrentIndex(0);
    setHistory([]);

    try {
      const response = await fetch(`${API_BASE_URL}/movies/discover`);
      if (!response.ok) {
        throw new Error("Movie service is unavailable");
      }
      const data = await response.json();
      setMovies(prepareMovies(Array.isArray(data) && data.length ? data : fallbackMovies, preferences));
      setApiStatus("online");
    } catch {
      setMovies(prepareMovies(fallbackMovies, preferences));
      setApiStatus("demo");
      showToast("Using demo movies until the API is reachable");
    } finally {
      setLoading(false);
    }
  }, [preferences, showToast]);

  useEffect(() => {
    let cancelled = false;

    readPersistedState()
      .then((savedState) => {
        if (cancelled || !savedState) return;

        setHasSeenOnboarding(!!savedState.hasSeenOnboarding);
        setIsLoggedIn(!!savedState.isLoggedIn);
        setHasPreferences(!!savedState.hasPreferences);
        setLikedMovies(Array.isArray(savedState.likedMovies) ? savedState.likedMovies : []);
        setPreferences(normalizePreferences(savedState.preferences));
        if (savedState.activeTab === "saved" || savedState.activeTab === "discover") {
          setActiveTab(savedState.activeTab);
        }
      })
      .finally(() => {
        if (!cancelled) setHasHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    loadMovies();
  }, [hasHydrated, loadMovies]);

  useEffect(() => {
    if (!hasHydrated) return;

    writePersistedState({
      activeTab,
      hasPreferences,
      hasSeenOnboarding,
      isLoggedIn,
      likedMovies,
      preferences,
    });
  }, [
    activeTab,
    hasHydrated,
    hasPreferences,
    hasSeenOnboarding,
    isLoggedIn,
    likedMovies,
    preferences,
  ]);

  const searchedMovies = filterMovies(movies, searchQuery);

  const updateSearchQuery = (value) => {
    setSearchQuery(value);
    setCurrentIndex(0);
    setHistory([]);
  };

  const handleSwipe = (direction) => {
    const movie = searchedMovies[currentIndex];
    if (!movie) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(
        direction === "right"
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
    }
    setHistory((items) => [...items, { direction, movie }]);
    if (direction === "right") {
      setLikedMovies((items) =>
        items.some((item) => item.id === movie.id) ? items : [movie, ...items]
      );
      showToast(`Added "${movie.title}" to My List`);
    } else {
      showToast(`Skipped "${movie.title}"`);
    }
    setCurrentIndex((index) => index + 1);
  };

  const undoLastSwipe = () => {
    const lastAction = history[history.length - 1];
    if (!lastAction) return;

    if (lastAction.direction === "right") {
      setLikedMovies((items) =>
        items.filter((movie) => movie.id !== lastAction.movie.id)
      );
    }
    setHistory((items) => items.slice(0, -1));
    setCurrentIndex((index) => Math.max(0, index - 1));
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    showToast("Undid last swipe");
  };

  const toggleWatched = (movieId) => {
    setLikedMovies((items) =>
      items.map((movie) =>
        movie.id === movieId ? { ...movie, watched: !movie.watched } : movie
      )
    );
  };

  useEffect(() => {
    if (Platform.OS !== "web") return undefined;

    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName?.toLowerCase();
      if (tagName === "input" || tagName === "textarea") return;
      if (!isLoggedIn || !hasPreferences || activeTab !== "discover") return;
      if (event.key === "ArrowRight") handleSwipe("right");
      if (event.key === "ArrowLeft") handleSwipe("left");
      if (event.key.toLowerCase() === "z") undoLastSwipe();
      if (event.key.toLowerCase() === "l") setActiveTab("saved");
      if (event.key.toLowerCase() === "d") setActiveTab("discover");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, currentIndex, hasPreferences, history, isLoggedIn, searchedMovies]);

  if (!hasHydrated) {
    return (
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        style={styles.safeArea}
      >
        <StatusBar style="light" />
        <View style={styles.bootScreen}>
          <Text style={styles.bootLogo}>CineSwipe</Text>
          <Text style={styles.bootSub}>LOADING YOUR WATCHLIST</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasSeenOnboarding) {
    return (
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        style={styles.safeArea}
      >
        <StatusBar style="light" />
        <View style={[styles.authFrame, isDesktopWeb && styles.authFrameDesktop]}>
          <OnboardingScreen onDone={() => setHasSeenOnboarding(true)} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        style={styles.safeArea}
      >
        <StatusBar style="light" />
        <View style={[styles.authFrame, isDesktopWeb && styles.authFrameDesktop]}>
          <LoginScreen onLogin={() => setIsLoggedIn(true)} />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPreferences) {
    return (
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        style={styles.safeArea}
      >
        <StatusBar style="light" />
        <View style={[styles.authFrame, isDesktopWeb && styles.authFrameDesktop]}>
          <PreferencesScreen
            onDone={(nextPreferences) => {
              setPreferences(nextPreferences);
              setHasPreferences(true);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.ambientRed} />
      <View style={styles.ambientGold} />

      <View style={[styles.appFrame, isDesktopWeb && styles.desktopFrame]}>
        {isDesktopWeb ? (
          <>
            <View style={styles.desktopSidebar}>
              <Text style={styles.desktopLogo}>CineSwipe</Text>
              <Text style={styles.desktopSub}>MOVIE DISCOVERY</Text>

              <View style={styles.desktopNav}>
                <DesktopNavItem
                  active={activeTab === "discover"}
                  label="Discover"
                  meta={`${Math.min(currentIndex + 1, searchedMovies.length || 1)} of ${
                    searchedMovies.length || 1
                  }`}
                  onPress={() => setActiveTab("discover")}
                />
                <DesktopNavItem
                  active={activeTab === "saved"}
                  label="Watchlist"
                  meta={`${likedMovies.length} saved`}
                  onPress={() => setActiveTab("saved")}
                />
                <DesktopNavItem
                  label="Preferences"
                  meta="Tune stack"
                  onPress={() => setHasPreferences(false)}
                />
              </View>

              <View style={styles.desktopShortcutCard}>
                <Text style={styles.desktopShortcutTitle}>Shortcuts</Text>
                <Text style={styles.desktopShortcut}>Left arrow: skip</Text>
                <Text style={styles.desktopShortcut}>Right arrow: like</Text>
                <Text style={styles.desktopShortcut}>Z: undo   L: list</Text>
              </View>
            </View>

            <View style={styles.desktopMain}>
              <DiscoverScreen
                currentIndex={currentIndex}
                apiStatus={apiStatus}
                isDesktopWeb
                likedCount={likedMovies.length}
                loading={loading}
                movies={searchedMovies}
                onOpenSaved={() => setActiveTab("saved")}
                onEditPreferences={() => setHasPreferences(false)}
                onReload={loadMovies}
                onSearchChange={updateSearchQuery}
                onSwipe={handleSwipe}
                onUndo={undoLastSwipe}
                preferences={preferences}
                searchQuery={searchQuery}
                totalMovies={movies.length}
                undoDisabled={!history.length}
              />
            </View>

            <View style={styles.desktopAside}>
              <SavedScreen
                compact
                movies={likedMovies}
                onDiscover={() => setActiveTab("discover")}
                onRemove={(movieId) =>
                  setLikedMovies((items) =>
                    items.filter((movie) => movie.id !== movieId)
                  )
                }
                onToggleWatched={toggleWatched}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.content}>
              {activeTab === "discover" ? (
                <DiscoverScreen
                  currentIndex={currentIndex}
                  apiStatus={apiStatus}
                  likedCount={likedMovies.length}
                  loading={loading}
                  movies={searchedMovies}
                  onOpenSaved={() => setActiveTab("saved")}
                  onEditPreferences={() => setHasPreferences(false)}
                  onReload={loadMovies}
                  onSearchChange={updateSearchQuery}
                  onSwipe={handleSwipe}
                  onUndo={undoLastSwipe}
                  preferences={preferences}
                  searchQuery={searchQuery}
                  totalMovies={movies.length}
                  undoDisabled={!history.length}
                />
              ) : (
                <SavedScreen
                  movies={likedMovies}
                  onDiscover={() => setActiveTab("discover")}
                  onRemove={(movieId) =>
                    setLikedMovies((items) =>
                      items.filter((movie) => movie.id !== movieId)
                    )
                  }
                  onToggleWatched={toggleWatched}
                />
              )}
            </View>

            <View style={styles.nav}>
              <Pressable
                onPress={() => setActiveTab("discover")}
                style={styles.navItem}
              >
                <Text
                  style={[
                    styles.navIcon,
                    activeTab === "discover" && styles.navIconActive,
                  ]}
                >
                  FILM
                </Text>
                <Text
                  style={[
                    styles.navLabel,
                    activeTab === "discover" && styles.navLabelActive,
                  ]}
                >
                  DISCOVER
                </Text>
              </Pressable>

              <Pressable
                disabled={!history.length}
                onPress={undoLastSwipe}
                style={[styles.undo, !history.length && styles.undoDisabled]}
              >
                <Text style={styles.undoIcon}>UNDO</Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveTab("saved")}
                style={styles.navItem}
              >
                <View>
                  <Text
                    style={[
                      styles.navIcon,
                      activeTab === "saved" && styles.navIconActive,
                    ]}
                  >
                    LIST
                  </Text>
                  {!!likedMovies.length && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{likedMovies.length}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.navLabel,
                    activeTab === "saved" && styles.navLabelActive,
                  ]}
                >
                  MY LIST
                </Text>
              </Pressable>
            </View>
          </>
        )}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              transform: [
                {
                  translateY: toastOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function DesktopNavItem({ active, label, meta, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.desktopNavItem, active && styles.desktopNavItemActive]}
    >
      <Text style={[styles.desktopNavLabel, active && styles.desktopNavLabelActive]}>
        {label}
      </Text>
      <Text style={styles.desktopNavMeta}>{meta}</Text>
    </Pressable>
  );
}

async function readPersistedState() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const rawState = await storage.getItem(STORAGE_KEY);
    return rawState ? JSON.parse(rawState) : null;
  } catch {
    return null;
  }
}

async function writePersistedState(state) {
  const storage = getStorage();
  if (!storage) return;

  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // A full or blocked browser storage should never break movie discovery.
  }
}

function getStorage() {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizePreferences(value) {
  return {
    ...DEFAULT_PREFERENCES,
    ...(value || {}),
    genres: Array.isArray(value?.genres) ? value.genres : [],
  };
}

function prepareMovies(items, preferences) {
  const filtered = items.filter((movie) => {
    const matchesGenre =
      !preferences.genres.length ||
      (movie.genre_ids || []).some((genreId) => preferences.genres.includes(genreId));
    const matchesRating = Number(movie.vote_average || 0) >= preferences.minRating;
    return matchesGenre && matchesRating;
  });

  const result = filtered.length ? filtered : items;

  return [...result].sort((a, b) => {
    if (preferences.sortMode === "topRated") {
      return Number(b.vote_average || 0) - Number(a.vote_average || 0);
    }

    if (preferences.sortMode === "newest") {
      return String(b.release_date || "").localeCompare(String(a.release_date || ""));
    }

    return Number(b.popularity || 0) - Number(a.popularity || 0);
  });
}

function filterMovies(items, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return items;

  return items.filter((movie) => {
    const title = movie.title?.toLowerCase() || "";
    const overview = movie.overview?.toLowerCase() || "";
    const year = movie.release_date?.slice(0, 4) || "";
    return (
      title.includes(normalizedQuery) ||
      overview.includes(normalizedQuery) ||
      year.includes(normalizedQuery)
    );
  });
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    alignItems: "stretch",
    backgroundColor: "#0A0A0F",
    flex: 1,
    justifyContent: "flex-start",
  },
  authFrame: {
    backgroundColor: "#0A0A0F",
    flex: 1,
    width: "100%",
  },
  authFrameDesktop: {
    alignSelf: "center",
    maxWidth: 1180,
    overflow: "hidden",
    width: "100%",
  },
  appFrame: {
    backgroundColor: "#0A0A0F",
    flex: 1,
    overflow: "hidden",
    width: "100%",
  },
  desktopFrame: {
    flexDirection: "row",
    padding: 22,
  },
  bootScreen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  bootLogo: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1,
  },
  bootSub: {
    color: "#F4A261",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 10,
  },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 6 },
  desktopSidebar: {
    backgroundColor: "rgba(18,18,26,0.82)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    borderWidth: 1,
    marginRight: 18,
    padding: 22,
    width: 260,
  },
  desktopLogo: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  desktopSub: {
    color: "#F4A261",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 4,
  },
  desktopNav: {
    gap: 12,
    marginTop: 34,
  },
  desktopNavItem: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  desktopNavItemActive: {
    backgroundColor: "rgba(230,57,70,0.16)",
    borderColor: "rgba(230,57,70,0.45)",
  },
  desktopNavLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  desktopNavLabelActive: {
    color: "#F4A261",
  },
  desktopNavMeta: {
    color: "#858A96",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  desktopShortcutCard: {
    backgroundColor: "rgba(244,162,97,0.10)",
    borderColor: "rgba(244,162,97,0.22)",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: "auto",
    padding: 16,
  },
  desktopShortcutTitle: {
    color: "#F4A261",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  desktopShortcut: {
    color: "#C9CCD3",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 20,
  },
  desktopMain: {
    flex: 1.15,
    minWidth: 420,
    paddingHorizontal: 8,
  },
  desktopAside: {
    backgroundColor: "rgba(18,18,26,0.72)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    borderWidth: 1,
    marginLeft: 18,
    padding: 18,
    width: 360,
  },
  ambientRed: {
    backgroundColor: "rgba(230, 57, 70, 0.14)",
    borderRadius: 220,
    height: 440,
    left: -260,
    position: "absolute",
    top: -180,
    width: 440,
  },
  ambientGold: {
    backgroundColor: "rgba(244, 162, 97, 0.10)",
    borderRadius: 190,
    bottom: -140,
    height: 380,
    position: "absolute",
    right: -210,
    width: 380,
  },
  nav: {
    alignItems: "center",
    backgroundColor: "rgba(10, 10, 15, 0.96)",
    borderTopColor: "rgba(255,255,255,0.07)",
    borderTopWidth: 1,
    flexDirection: "row",
    height: 84,
    justifyContent: "space-around",
    paddingBottom: 8,
    paddingHorizontal: 28,
  },
  webHint: {
    alignItems: "center",
    backgroundColor: "rgba(244, 162, 97, 0.10)",
    borderBottomColor: "rgba(244, 162, 97, 0.18)",
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  webHintText: {
    color: "#F4A261",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 76,
  },
  navIcon: {
    color: "#565B67",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  navIconActive: { color: "#F4A261" },
  navLabel: {
    color: "#565B67",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 5,
  },
  navLabelActive: { color: "#F4A261" },
  undo: {
    alignItems: "center",
    backgroundColor: "#1C1C28",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    marginTop: -22,
    width: 58,
  },
  undoDisabled: { opacity: 0.35 },
  undoIcon: {
    color: "#F4A261",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#E63946",
    borderColor: "#0A0A0F",
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    justifyContent: "center",
    minWidth: 18,
    paddingHorizontal: 4,
    position: "absolute",
    right: -17,
    top: -8,
  },
  countText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  toast: {
    alignSelf: "center",
    backgroundColor: "rgba(28, 28, 40, 0.96)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 28,
    borderWidth: 1,
    bottom: 104,
    maxWidth: "88%",
    paddingHorizontal: 18,
    paddingVertical: 11,
    position: "absolute",
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
