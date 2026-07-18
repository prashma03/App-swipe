import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const SLIDES = [
  {
    title: "Swipe with purpose",
    body: "Right saves a movie. Left skips it. Your watchlist builds as you go.",
    marker: "01",
  },
  {
    title: "Tap INFO",
    body: "Open ratings, trailer search, plot, and quick actions before you decide.",
    marker: "02",
  },
  {
    title: "Tune your taste",
    body: "Choose genres and ratings so every stack feels more like yours.",
    marker: "03",
  },
];

export function OnboardingScreen({ onDone }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.screen}>
      <StageDecor />

      <View style={[styles.content, isWide && styles.contentWide]}>
        <BrandLockup />

        <View style={[styles.heroCard, isWide && styles.heroCardWide]}>
          <View style={[styles.copy, isWide && styles.copyWide]}>
            <Text style={styles.marker}>{slide.marker}</Text>
            <View style={styles.markerLine} />
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

          <PosterStack compact={!isWide} />
        </View>

        <Pressable
          onPress={() => (isLast ? onDone() : setIndex((value) => value + 1))}
          style={styles.buttonWrap}
        >
          <LinearGradient
            colors={["#F02D55", "#FF8A28"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{isLast ? "Get started" : "Next"}</Text>
            <Text style={styles.buttonArrow}>{">"}</Text>
          </LinearGradient>
        </Pressable>

        {!isLast && (
          <View style={styles.skipRow}>
            <View style={styles.skipLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.skipLine} />
          </View>
        )}

        {!isLast && (
          <Pressable onPress={onDone} style={styles.skip}>
            <Text style={styles.skipText}>Skip intro</Text>
            <Text style={styles.skipArrow}>{">"}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function BrandLockup() {
  return (
    <View style={styles.brandWrap}>
      <View style={styles.logoTile}>
        <LinearGradient
          colors={["#F02D55", "#FFB05A"]}
          style={styles.logoGradient}
        >
          <View style={styles.logoClapperTop} />
          <Text style={styles.logoPlay}>{">"}</Text>
        </LinearGradient>
      </View>
      <Text style={styles.brand}>
        Cine<Text style={styles.brandAccent}>Swipe</Text>
      </Text>
      <Text style={styles.sub}>A SMALL CINEMA IN YOUR POCKET</Text>
    </View>
  );
}

function StageDecor() {
  return (
    <>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />
      <View style={styles.dotGrid}>
        {Array.from({ length: 16 }).map((_, item) => (
          <View key={item} style={styles.gridDot} />
        ))}
      </View>
      <View style={styles.reelWrap}>
        <View style={styles.reel}>
          {Array.from({ length: 5 }).map((_, item) => (
            <View key={item} style={styles.reelHole} />
          ))}
        </View>
        <View style={styles.filmTail} />
      </View>
      <View style={styles.clapboard}>
        <View style={styles.clapTop} />
        <View style={styles.clapLine} />
        <View style={styles.clapLineShort} />
      </View>
      <View style={styles.popcorn} />
    </>
  );
}

function PosterStack({ compact }) {
  return (
    <View style={[styles.posterStage, compact && styles.posterStageCompact]}>
      <View style={[styles.posterCard, styles.posterBack]}>
        <LinearGradient
          colors={["#293141", "#11141E"]}
          style={styles.posterArt}
        />
      </View>
      <View style={[styles.posterCard, styles.posterFront]}>
        <LinearGradient
          colors={["#EC324A", "#FF8A28", "#171726"]}
          style={styles.posterArt}
        >
          <View style={styles.posterSun} />
          <View style={styles.posterFigure} />
        </LinearGradient>
      </View>
      <View style={[styles.voteBubble, styles.passBubble]}>
        <Text style={styles.passText}>X</Text>
      </View>
      <View style={[styles.voteBubble, styles.likeBubble]}>
        <Text style={styles.likeText}>+</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05060D",
    flex: 1,
    overflow: "hidden",
  },
  content: {
    alignSelf: "center",
    flex: 1,
    justifyContent: "center",
    maxWidth: 980,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: "100%",
  },
  contentWide: {
    paddingHorizontal: 52,
  },
  topGlow: {
    backgroundColor: "rgba(240, 45, 85, 0.24)",
    borderRadius: 220,
    height: 440,
    position: "absolute",
    right: -130,
    top: -210,
    width: 440,
  },
  bottomGlow: {
    backgroundColor: "rgba(255, 138, 40, 0.10)",
    borderRadius: 260,
    bottom: -210,
    height: 420,
    left: -130,
    position: "absolute",
    width: 420,
  },
  dotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    left: 34,
    position: "absolute",
    top: 38,
    width: 76,
  },
  gridDot: {
    backgroundColor: "#E63946",
    borderRadius: 3,
    height: 6,
    opacity: 0.8,
    width: 6,
  },
  reelWrap: {
    opacity: 0.88,
    position: "absolute",
    right: 38,
    top: 38,
  },
  reel: {
    alignItems: "center",
    backgroundColor: "rgba(239, 75, 75, 0.18)",
    borderColor: "rgba(255, 142, 78, 0.55)",
    borderRadius: 76,
    borderWidth: 4,
    height: 132,
    justifyContent: "center",
    shadowColor: "#F04D4F",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    width: 132,
  },
  reelHole: {
    backgroundColor: "#05060D",
    borderColor: "rgba(255, 142, 78, 0.5)",
    borderRadius: 18,
    borderWidth: 1,
    height: 28,
    margin: 3,
    width: 28,
  },
  filmTail: {
    backgroundColor: "rgba(239, 75, 75, 0.10)",
    borderColor: "rgba(255, 142, 78, 0.22)",
    borderRadius: 30,
    borderWidth: 1,
    height: 150,
    marginLeft: 58,
    marginTop: -8,
    transform: [{ rotate: "28deg" }],
    width: 38,
  },
  clapboard: {
    backgroundColor: "rgba(15, 17, 25, 0.9)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    borderWidth: 1,
    bottom: 40,
    height: 110,
    left: 34,
    padding: 14,
    position: "absolute",
    transform: [{ rotate: "-7deg" }],
    width: 168,
  },
  clapTop: {
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 4,
    height: 24,
    marginBottom: 18,
  },
  clapLine: {
    backgroundColor: "rgba(255,255,255,0.14)",
    height: 1,
    marginBottom: 18,
  },
  clapLineShort: {
    backgroundColor: "rgba(255,255,255,0.12)",
    height: 1,
    width: "64%",
  },
  popcorn: {
    backgroundColor: "#D9483E",
    borderColor: "#FFD8A7",
    borderRadius: 18,
    borderWidth: 3,
    bottom: 20,
    height: 54,
    left: 145,
    position: "absolute",
    width: 46,
  },
  brandWrap: {
    alignItems: "center",
    marginBottom: 34,
  },
  logoTile: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#F04D4F",
    shadowOpacity: 0.45,
    shadowRadius: 22,
  },
  logoGradient: {
    alignItems: "center",
    borderRadius: 18,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  logoClapperTop: {
    backgroundColor: "rgba(5, 6, 13, 0.45)",
    borderRadius: 3,
    height: 9,
    position: "absolute",
    top: 10,
    width: 34,
  },
  logoPlay: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginLeft: 3,
    marginTop: 9,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 45,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginTop: 12,
  },
  brandAccent: {
    color: "#FF8A50",
  },
  sub: {
    color: "#858A96",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 4,
    marginTop: 6,
    textAlign: "center",
  },
  heroCard: {
    backgroundColor: "rgba(20, 22, 34, 0.84)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 26,
    borderWidth: 1,
    minHeight: 344,
    overflow: "hidden",
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 34,
  },
  heroCardWide: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 34,
  },
  copy: {
    zIndex: 2,
  },
  copyWide: {
    maxWidth: 420,
  },
  marker: {
    color: "#F02D55",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  markerLine: {
    backgroundColor: "#F02D55",
    height: 2,
    marginTop: 13,
    width: 34,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 33,
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 38,
    marginTop: 27,
    textTransform: "uppercase",
  },
  body: {
    color: "#BEC2CC",
    fontSize: 17,
    lineHeight: 28,
    marginTop: 22,
  },
  dots: {
    flexDirection: "row",
    gap: 10,
    marginTop: 52,
  },
  dot: {
    backgroundColor: "#3D4053",
    borderRadius: 7,
    height: 12,
    width: 12,
  },
  dotActive: {
    backgroundColor: "#F02D55",
    width: 36,
  },
  posterStage: {
    height: 260,
    marginLeft: 22,
    width: 300,
  },
  posterStageCompact: {
    alignSelf: "center",
    height: 190,
    marginLeft: 0,
    marginTop: -18,
    opacity: 0.92,
    transform: [{ scale: 0.86 }],
  },
  posterCard: {
    borderRadius: 18,
    height: 198,
    overflow: "hidden",
    position: "absolute",
    top: 34,
    width: 132,
  },
  posterBack: {
    left: 54,
    opacity: 0.72,
    transform: [{ rotate: "-11deg" }],
  },
  posterFront: {
    borderColor: "#F02D55",
    borderWidth: 2,
    left: 146,
    shadowColor: "#F02D55",
    shadowOpacity: 0.75,
    shadowRadius: 22,
    transform: [{ rotate: "7deg" }],
  },
  posterArt: {
    flex: 1,
  },
  posterSun: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 34,
    height: 68,
    position: "absolute",
    right: -12,
    top: 58,
    width: 68,
  },
  posterFigure: {
    backgroundColor: "#0A0A0F",
    borderRadius: 8,
    bottom: 22,
    height: 42,
    left: 58,
    opacity: 0.7,
    position: "absolute",
    width: 14,
  },
  voteBubble: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 34,
    borderWidth: 1,
    height: 62,
    justifyContent: "center",
    position: "absolute",
    width: 62,
  },
  passBubble: {
    backgroundColor: "rgba(15,17,26,0.86)",
    left: 36,
    top: 118,
  },
  likeBubble: {
    backgroundColor: "rgba(255,255,255,0.94)",
    right: 18,
    top: 118,
  },
  passText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "600",
  },
  likeText: {
    color: "#F02D55",
    fontSize: 27,
  },
  buttonWrap: {
    borderRadius: 34,
    marginTop: 34,
    overflow: "hidden",
    shadowColor: "#FF6A2D",
    shadowOpacity: 0.38,
    shadowRadius: 22,
  },
  button: {
    alignItems: "center",
    flexDirection: "row",
    height: 70,
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },
  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "600",
    marginLeft: 22,
    marginTop: -2,
  },
  skipRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 28,
  },
  skipLine: {
    backgroundColor: "rgba(255,255,255,0.10)",
    flex: 1,
    height: 1,
  },
  orText: {
    color: "#707585",
    fontSize: 13,
    fontWeight: "800",
    marginHorizontal: 22,
  },
  skip: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 22,
  },
  skipText: {
    color: "#9BA0AC",
    fontSize: 16,
    fontWeight: "800",
  },
  skipArrow: {
    color: "#6C7280",
    fontSize: 23,
    marginLeft: 16,
    marginTop: -1,
  },
});
