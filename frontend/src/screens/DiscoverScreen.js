import { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MovieCard } from "../components/MovieCard";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.24;

export function DiscoverScreen({
  currentIndex,
  loading,
  movies,
  onReload,
  onSwipe,
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const currentMovie = movies[currentIndex];
  const nextMovie = movies[currentIndex + 1];

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-13deg", "0deg", "13deg"],
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const passOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const completeSwipe = (direction) => {
    const x = direction === "right" ? SCREEN_WIDTH * 1.4 : -SCREEN_WIDTH * 1.4;
    Animated.timing(position, {
      duration: 230,
      toValue: { x, y: 20 },
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      onSwipe(direction);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6,
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy * 0.25 });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            completeSwipe("right");
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
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
    [currentIndex, movies.length]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF4F75" size="large" />
        <Text style={styles.loadingText}>Finding your next favorite...</Text>
      </View>
    );
  }

  if (!currentMovie) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>✓</Text>
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
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TONIGHT'S PICKS</Text>
          <Text style={styles.heading}>Discover</Text>
        </View>
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {currentIndex + 1}/{movies.length}
          </Text>
        </View>
      </View>

      <View style={styles.deck}>
        {!!nextMovie && (
          <View style={styles.nextCard}>
            <MovieCard movie={nextMovie} />
          </View>
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
          <Animated.View style={[styles.decision, styles.like, { opacity: likeOpacity }]}>
            <Text style={styles.likeText}>MY LIST</Text>
          </Animated.View>
          <Animated.View style={[styles.decision, styles.pass, { opacity: passOpacity }]}>
            <Text style={styles.passText}>PASS</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Pass on this movie"
          onPress={() => completeSwipe("left")}
          style={[styles.actionButton, styles.passButton]}
        >
          <Text style={styles.passSymbol}>×</Text>
        </Pressable>
        <View style={styles.hintWrap}>
          <Text style={styles.hint}>SWIPE TO CHOOSE</Text>
          <View style={styles.hintLine} />
        </View>
        <Pressable
          accessibilityLabel="Save this movie"
          onPress={() => completeSwipe("right")}
          style={[styles.actionButton, styles.likeButton]}
        >
          <Text style={styles.likeSymbol}>♥</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  eyebrow: {
    color: "#FF4F75",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginTop: 2,
  },
  counter: {
    backgroundColor: "#171A21",
    borderColor: "#252935",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  counterText: { color: "#A8ACB7", fontSize: 12, fontWeight: "700" },
  deck: { flex: 1, minHeight: 450 },
  nextCard: {
    bottom: 8,
    left: 8,
    opacity: 0.55,
    position: "absolute",
    right: 8,
    top: 14,
    transform: [{ scale: 0.965 }],
  },
  activeCard: {
    bottom: 12,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  decision: {
    borderRadius: 8,
    borderWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 7,
    position: "absolute",
    top: 54,
  },
  like: {
    borderColor: "#67E8B1",
    left: 24,
    transform: [{ rotate: "-10deg" }],
  },
  pass: {
    borderColor: "#FF5A78",
    right: 24,
    transform: [{ rotate: "10deg" }],
  },
  likeText: { color: "#67E8B1", fontSize: 22, fontWeight: "900" },
  passText: { color: "#FF5A78", fontSize: 22, fontWeight: "900" },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 14,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  passButton: {
    backgroundColor: "#191C24",
    borderColor: "#2D313D",
    borderWidth: 1,
  },
  likeButton: {
    backgroundColor: "#FF4F75",
    shadowColor: "#FF4F75",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
  },
  passSymbol: {
    color: "#D1D4DC",
    fontSize: 34,
    fontWeight: "300",
    marginTop: -4,
  },
  likeSymbol: { color: "#FFFFFF", fontSize: 23 },
  hintWrap: { alignItems: "center", marginHorizontal: 22 },
  hint: { color: "#666B77", fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  hintLine: {
    backgroundColor: "#343842",
    borderRadius: 2,
    height: 3,
    marginTop: 7,
    width: 30,
  },
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  loadingText: { color: "#969AA5", fontSize: 14, marginTop: 14 },
  emptyIcon: {
    color: "#67E8B1",
    fontSize: 48,
    fontWeight: "300",
    marginBottom: 16,
  },
  emptyTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800" },
  emptyBody: {
    color: "#969AA5",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  reloadButton: {
    backgroundColor: "#FF4F75",
    borderRadius: 24,
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  reloadText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
