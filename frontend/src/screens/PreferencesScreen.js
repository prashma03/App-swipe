import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const GENRE_OPTIONS = [
  { id: 28, label: "Action" },
  { id: 35, label: "Comedy" },
  { id: 18, label: "Drama" },
  { id: 27, label: "Horror" },
  { id: 10749, label: "Romance" },
  { id: 878, label: "Sci-Fi" },
  { id: 16, label: "Animation" },
  { id: 53, label: "Thriller" },
];

const RATING_OPTIONS = [0, 6, 7, 8];
const SORT_OPTIONS = [
  { id: "popular", label: "Popular" },
  { id: "topRated", label: "Top Rated" },
  { id: "newest", label: "Newest" },
];

export function PreferencesScreen({ onDone }) {
  const [genres, setGenres] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortMode, setSortMode] = useState("popular");

  const toggleGenre = (genreId) => {
    setGenres((items) =>
      items.includes(genreId)
        ? items.filter((item) => item !== genreId)
        : [...items, genreId]
    );
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>PERSONALIZE</Text>
      <Text style={styles.title}>Tune your stack</Text>
      <Text style={styles.body}>
        Choose what you like. You can keep everything open and still explore.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Section title="Favorite genres">
          <View style={styles.chipWrap}>
            {GENRE_OPTIONS.map((genre) => {
              const selected = genres.includes(genre.id);
              return (
                <Pressable
                  key={genre.id}
                  onPress={() => toggleGenre(genre.id)}
                  style={[styles.chip, selected && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {genre.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Minimum rating">
          <View style={styles.optionRow}>
            {RATING_OPTIONS.map((rating) => {
              const selected = minRating === rating;
              return (
                <Pressable
                  key={rating}
                  onPress={() => setMinRating(rating)}
                  style={[styles.option, selected && styles.optionActive]}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                    {rating ? `${rating}+` : "Any"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Show me">
          <View style={styles.optionRow}>
            {SORT_OPTIONS.map((option) => {
              const selected = sortMode === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSortMode(option.id)}
                  style={[styles.option, selected && styles.optionActive]}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Section>
      </ScrollView>

      <Pressable
        onPress={() => onDone({ genres, minRating, sortMode })}
        style={styles.buttonWrap}
      >
        <LinearGradient
          colors={["#E63946", "#F4A261"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Start swiping</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function Section({ children, title }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#0A0A0F",
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 42,
  },
  kicker: {
    color: "#F4A261",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 7,
    textTransform: "uppercase",
  },
  body: {
    color: "#8F95A0",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 10,
  },
  section: {
    marginTop: 26,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: "#171722",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  chipActive: {
    backgroundColor: "#E63946",
    borderColor: "#E63946",
  },
  chipText: {
    color: "#A3A7B0",
    fontSize: 13,
    fontWeight: "800",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    alignItems: "center",
    backgroundColor: "#171722",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 17,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 13,
  },
  optionActive: {
    backgroundColor: "rgba(244, 162, 97, 0.16)",
    borderColor: "#F4A261",
  },
  optionText: {
    color: "#A3A7B0",
    fontSize: 12,
    fontWeight: "900",
  },
  optionTextActive: {
    color: "#F4A261",
  },
  buttonWrap: {
    borderRadius: 20,
    marginBottom: 22,
    marginTop: 20,
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
});
