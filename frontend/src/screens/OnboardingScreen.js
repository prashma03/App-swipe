import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const SLIDES = [
  {
    title: "Swipe with purpose",
    body: "Right saves a movie. Left skips it. Your watchlist builds as you go.",
    marker: "01",
  },
  {
    title: "Tap INFO",
    body: "Open the detail sheet for ratings, trailer search, plot, and quick actions.",
    marker: "02",
  },
  {
    title: "Tune your taste",
    body: "Choose favorite genres and ratings so the stack feels more like yours.",
    marker: "03",
  },
];

export function OnboardingScreen({ onDone }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.screen}>
      <View style={styles.glow} />
      <Text style={styles.brand}>CineSwipe</Text>
      <Text style={styles.sub}>A SMALL CINEMA IN YOUR POCKET</Text>

      <View style={styles.card}>
        <Text style={styles.marker}>{slide.marker}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        <View style={styles.dots}>
          {SLIDES.map((item, dotIndex) => (
            <View
              key={item.marker}
              style={[styles.dot, dotIndex === index && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => (isLast ? onDone() : setIndex((value) => value + 1))}
        style={styles.buttonWrap}
      >
        <LinearGradient
          colors={["#E63946", "#F4A261"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{isLast ? "Get started" : "Next"}</Text>
        </LinearGradient>
      </Pressable>

      {!isLast && (
        <Pressable onPress={onDone} style={styles.skip}>
          <Text style={styles.skipText}>Skip intro</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#0A0A0F",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  glow: {
    backgroundColor: "rgba(230, 57, 70, 0.15)",
    borderRadius: 220,
    height: 440,
    position: "absolute",
    right: -230,
    top: -160,
    width: 440,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.2,
    textAlign: "center",
  },
  sub: {
    color: "#6C757D",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 5,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(28,28,40,0.82)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 52,
    padding: 26,
  },
  marker: {
    color: "#F4A261",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 35,
    marginTop: 14,
    textTransform: "uppercase",
  },
  body: {
    color: "#A3A7B0",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
  },
  dots: {
    flexDirection: "row",
    gap: 7,
    marginTop: 28,
  },
  dot: {
    backgroundColor: "#3D3D50",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: "#E63946",
    width: 28,
  },
  buttonWrap: {
    borderRadius: 20,
    marginTop: 28,
    overflow: "hidden",
  },
  button: {
    alignItems: "center",
    height: 58,
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  skip: { padding: 18 },
  skipText: {
    color: "#6C757D",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
});
