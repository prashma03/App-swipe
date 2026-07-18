import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

export function LoginScreen({ onLogin }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 860;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showError, setShowError] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setShowError(true);
      return;
    }

    setShowError(false);
    onLogin({ email: email.trim(), rememberMe });
  };

  const handleGuestLogin = () => {
    setShowError(false);
    onLogin({ email: "guest@cineswipe.app", rememberMe: false });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <AuthDecor />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.shell, isWide && styles.shellWide]}>
          <View style={[styles.hero, isWide && styles.heroWide]}>
            <BrandLockup />
            <Text style={styles.heroTitle}>Your next movie night starts here</Text>
            <Text style={styles.heroBody}>
              Save the films that catch your eye, skip the rest, and come back
              to a watchlist that actually feels like yours.
            </Text>
            <MiniPosterDeck />
          </View>

          <View style={[styles.card, isWide && styles.cardWide]}>
            <Text style={styles.cardKicker}>WELCOME BACK</Text>
            <Text style={styles.cardTitle}>Sign in to CineSwipe</Text>
            <Text style={styles.cardBody}>
              Keep your saved films, watched list, and preferences together.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                onSubmitEditing={handleLogin}
                placeholder="you@example.com"
                placeholderTextColor="#5D6372"
                returnKeyType="next"
                style={styles.input}
                value={email}
              />

              <Text style={[styles.label, styles.passwordLabel]}>PASSWORD</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
                placeholder="Enter your password"
                placeholderTextColor="#5D6372"
                returnKeyType="go"
                secureTextEntry
                style={styles.input}
                value={password}
              />

              {showError && (
                <Text style={styles.error}>Enter an email and password to continue.</Text>
              )}

              <Pressable
                onPress={() => setRememberMe((value) => !value)}
                style={styles.rememberRow}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Text style={styles.checkboxText}>OK</Text>}
                </View>
                <Text style={styles.rememberText}>Remember me on this device</Text>
              </Pressable>

              <Pressable onPress={handleLogin} style={styles.buttonWrap}>
                <LinearGradient
                  colors={["#F02D55", "#FF8A28"]}
                  end={{ x: 1, y: 0 }}
                  start={{ x: 0, y: 0 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Start discovering</Text>
                  <Text style={styles.arrow}>{">"}</Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <Pressable onPress={handleGuestLogin} style={styles.guestButton}>
                <Text style={styles.guestText}>Continue as Guest</Text>
                <Text style={styles.guestArrow}>{">"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BrandLockup() {
  return (
    <View style={styles.brandWrap}>
      <View style={styles.logoTile}>
        <LinearGradient colors={["#F02D55", "#FFB05A"]} style={styles.logoGradient}>
          <View style={styles.logoTop} />
          <Text style={styles.logoPlay}>{">"}</Text>
        </LinearGradient>
      </View>
      <Text style={styles.brand}>
        Cine<Text style={styles.brandAccent}>Swipe</Text>
      </Text>
      <Text style={styles.tagline}>A SMALL CINEMA IN YOUR POCKET</Text>
    </View>
  );
}

function AuthDecor() {
  return (
    <>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />
      <View style={styles.dotGrid}>
        {Array.from({ length: 16 }).map((_, item) => (
          <View key={item} style={styles.gridDot} />
        ))}
      </View>
      <View style={styles.reel}>
        {Array.from({ length: 5 }).map((_, item) => (
          <View key={item} style={styles.reelHole} />
        ))}
      </View>
      <View style={styles.clapper}>
        <View style={styles.clapperTop} />
        <View style={styles.clapperLine} />
        <View style={styles.clapperLineShort} />
      </View>
    </>
  );
}

function MiniPosterDeck() {
  return (
    <View style={styles.posterDeck}>
      <View style={[styles.poster, styles.posterLeft]}>
        <LinearGradient colors={["#262C3B", "#0E111B"]} style={styles.posterFill} />
      </View>
      <View style={[styles.poster, styles.posterRight]}>
        <LinearGradient
          colors={["#F02D55", "#FF8A28", "#131521"]}
          style={styles.posterFill}
        >
          <View style={styles.posterMoon} />
          <View style={styles.posterPerson} />
        </LinearGradient>
      </View>
      <View style={[styles.vote, styles.voteNo]}>
        <Text style={styles.voteNoText}>X</Text>
      </View>
      <View style={[styles.vote, styles.voteYes]}>
        <Text style={styles.voteYesText}>+</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  scrollContentWide: {
    paddingHorizontal: 54,
  },
  shell: {
    alignSelf: "center",
    maxWidth: 1080,
    width: "100%",
  },
  shellWide: {
    alignItems: "center",
    flexDirection: "row",
    gap: 34,
    justifyContent: "center",
  },
  topGlow: {
    backgroundColor: "rgba(240, 45, 85, 0.25)",
    borderRadius: 240,
    height: 460,
    position: "absolute",
    right: -150,
    top: -220,
    width: 460,
  },
  bottomGlow: {
    backgroundColor: "rgba(255, 138, 40, 0.10)",
    borderRadius: 260,
    bottom: -190,
    height: 420,
    left: -140,
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
    opacity: 0.78,
    width: 6,
  },
  reel: {
    alignItems: "center",
    backgroundColor: "rgba(239, 75, 75, 0.15)",
    borderColor: "rgba(255, 142, 78, 0.42)",
    borderRadius: 74,
    borderWidth: 4,
    height: 128,
    justifyContent: "center",
    position: "absolute",
    right: 36,
    top: 42,
    width: 128,
  },
  reelHole: {
    backgroundColor: "#05060D",
    borderColor: "rgba(255, 142, 78, 0.44)",
    borderRadius: 18,
    borderWidth: 1,
    height: 28,
    margin: 3,
    width: 28,
  },
  clapper: {
    backgroundColor: "rgba(15,17,25,0.9)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    borderWidth: 1,
    bottom: 34,
    height: 110,
    left: 32,
    padding: 14,
    position: "absolute",
    transform: [{ rotate: "-7deg" }],
    width: 168,
  },
  clapperTop: {
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 4,
    height: 24,
    marginBottom: 18,
  },
  clapperLine: {
    backgroundColor: "rgba(255,255,255,0.14)",
    height: 1,
    marginBottom: 18,
  },
  clapperLineShort: {
    backgroundColor: "rgba(255,255,255,0.12)",
    height: 1,
    width: "64%",
  },
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroWide: {
    alignItems: "flex-start",
    flex: 1,
    marginBottom: 0,
    maxWidth: 470,
  },
  brandWrap: {
    alignItems: "center",
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
  logoTop: {
    backgroundColor: "rgba(5, 6, 13, 0.45)",
    borderRadius: 3,
    height: 9,
    position: "absolute",
    top: 10,
    width: 34,
  },
  logoPlay: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    marginLeft: 3,
    marginTop: 6,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.1,
    marginTop: 12,
    textAlign: "center",
  },
  brandAccent: {
    color: "#FF8A50",
  },
  tagline: {
    color: "#858A96",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 3.2,
    marginTop: 6,
    textAlign: "center",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 37,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 42,
    marginTop: 40,
    textAlign: "center",
    textTransform: "uppercase",
  },
  heroBody: {
    color: "#ADB2BE",
    fontSize: 16,
    lineHeight: 25,
    marginTop: 16,
    maxWidth: 440,
    textAlign: "center",
  },
  posterDeck: {
    height: 230,
    marginTop: 30,
    width: 300,
  },
  poster: {
    borderRadius: 18,
    height: 184,
    overflow: "hidden",
    position: "absolute",
    top: 20,
    width: 124,
  },
  posterLeft: {
    left: 54,
    opacity: 0.72,
    transform: [{ rotate: "-11deg" }],
  },
  posterRight: {
    borderColor: "#F02D55",
    borderWidth: 2,
    left: 146,
    shadowColor: "#F02D55",
    shadowOpacity: 0.7,
    shadowRadius: 22,
    transform: [{ rotate: "7deg" }],
  },
  posterFill: {
    flex: 1,
  },
  posterMoon: {
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 28,
    height: 56,
    position: "absolute",
    right: -8,
    top: 58,
    width: 56,
  },
  posterPerson: {
    backgroundColor: "#0A0A0F",
    borderRadius: 7,
    bottom: 22,
    height: 38,
    left: 54,
    opacity: 0.7,
    position: "absolute",
    width: 12,
  },
  vote: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 31,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    top: 99,
    width: 56,
  },
  voteNo: {
    backgroundColor: "rgba(15,17,26,0.86)",
    left: 38,
  },
  voteYes: {
    backgroundColor: "rgba(255,255,255,0.94)",
    right: 20,
  },
  voteNoText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  voteYesText: {
    color: "#F02D55",
    fontSize: 28,
    fontWeight: "900",
  },
  card: {
    backgroundColor: "rgba(20, 22, 34, 0.88)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 34,
  },
  cardWide: {
    flex: 1,
    maxWidth: 470,
    padding: 32,
  },
  cardKicker: {
    color: "#F02D55",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 10,
    textTransform: "uppercase",
  },
  cardBody: {
    color: "#99A0AE",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  form: {
    marginTop: 24,
  },
  label: {
    color: "#9A9FAA",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 9,
  },
  passwordLabel: {
    marginTop: 18,
  },
  input: {
    backgroundColor: "rgba(8, 10, 17, 0.72)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#FFFFFF",
    fontSize: 15,
    height: 56,
    paddingHorizontal: 17,
  },
  error: {
    color: "#FF718E",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },
  rememberRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 15,
  },
  checkbox: {
    alignItems: "center",
    backgroundColor: "rgba(8, 10, 17, 0.72)",
    borderColor: "rgba(255,255,255,0.13)",
    borderRadius: 7,
    borderWidth: 1,
    height: 23,
    justifyContent: "center",
    width: 23,
  },
  checkboxActive: {
    backgroundColor: "#F02D55",
    borderColor: "#F02D55",
  },
  checkboxText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "900",
  },
  rememberText: {
    color: "#A7ACB7",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 10,
  },
  buttonWrap: {
    borderRadius: 24,
    marginTop: 25,
    overflow: "hidden",
    shadowColor: "#FF6A2D",
    shadowOpacity: 0.34,
    shadowRadius: 18,
  },
  button: {
    alignItems: "center",
    borderRadius: 24,
    flexDirection: "row",
    height: 60,
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 23,
    marginLeft: 14,
    marginTop: -2,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
  },
  divider: {
    backgroundColor: "rgba(255,255,255,0.10)",
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: "#707585",
    fontSize: 12,
    fontWeight: "800",
    marginHorizontal: 16,
  },
  guestButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    height: 54,
    justifyContent: "center",
    marginTop: 16,
  },
  guestText: {
    color: "#F4A261",
    fontSize: 14,
    fontWeight: "900",
  },
  guestArrow: {
    color: "#F4A261",
    fontSize: 20,
    marginLeft: 12,
    marginTop: -1,
  },
});
