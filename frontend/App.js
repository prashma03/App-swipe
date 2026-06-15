import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { API_BASE_URL } from "./src/config";
import { fallbackMovies } from "./src/data/fallbackMovies";
import { DiscoverScreen } from "./src/screens/DiscoverScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { SavedScreen } from "./src/screens/SavedScreen";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setCurrentIndex(0);
    setHistory([]);

    try {
      const response = await fetch(`${API_BASE_URL}/movies/discover`);
      if (!response.ok) {
        throw new Error("Movie service is unavailable");
      }
      const data = await response.json();
      setMovies(Array.isArray(data) && data.length ? data : fallbackMovies);
    } catch {
      setMovies(fallbackMovies);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const handleSwipe = (direction) => {
    const movie = movies[currentIndex];
    if (!movie) return;

    setHistory((items) => [...items, { direction, movie }]);
    if (direction === "right") {
      setLikedMovies((items) =>
        items.some((item) => item.id === movie.id) ? items : [movie, ...items]
      );
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
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
        <StatusBar style="light" />
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {activeTab === "discover" ? (
          <DiscoverScreen
            currentIndex={currentIndex}
            loading={loading}
            movies={movies}
            onReload={loadMovies}
            onSwipe={handleSwipe}
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
            ◈
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
          <Text style={styles.undoIcon}>↶</Text>
        </Pressable>

        <Pressable onPress={() => setActiveTab("saved")} style={styles.navItem}>
          <View>
            <Text
              style={[
                styles.navIcon,
                activeTab === "saved" && styles.navIconActive,
              ]}
            >
              ♥
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
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#090B10", flex: 1 },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  nav: {
    alignItems: "center",
    backgroundColor: "#0D0F14",
    borderTopColor: "#1D2028",
    borderTopWidth: 1,
    flexDirection: "row",
    height: 82,
    justifyContent: "space-around",
    paddingBottom: 8,
    paddingHorizontal: 28,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
  },
  navIcon: { color: "#565B67", fontSize: 21 },
  navIconActive: { color: "#FF4F75" },
  navLabel: {
    color: "#565B67",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },
  navLabelActive: { color: "#FF4F75" },
  undo: {
    alignItems: "center",
    backgroundColor: "#191C24",
    borderColor: "#2A2E38",
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    marginTop: -20,
    width: 48,
  },
  undoDisabled: { opacity: 0.35 },
  undoIcon: { color: "#E7E8EB", fontSize: 23 },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#FF4F75",
    borderColor: "#0D0F14",
    borderRadius: 8,
    borderWidth: 2,
    height: 16,
    justifyContent: "center",
    minWidth: 16,
    paddingHorizontal: 3,
    position: "absolute",
    right: -11,
    top: -5,
  },
  countText: { color: "#FFFFFF", fontSize: 8, fontWeight: "900" },
});
