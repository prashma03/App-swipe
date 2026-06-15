import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setShowError(true);
      return;
    }

    setShowError(false);
    onLogin();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.content}>
        <View style={styles.logo}>
          <LinearGradient
            colors={["#FF6B8A", "#E83E68"]}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>M</Text>
          </LinearGradient>
        </View>

        <Text style={styles.brand}>MovieSwipe</Text>
        <Text style={styles.tagline}>Find your next favorite movie</Text>

        <View style={styles.form}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            onSubmitEditing={handleLogin}
            placeholder="you@example.com"
            placeholderTextColor="#555B68"
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
            placeholderTextColor="#555B68"
            returnKeyType="go"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {showError && (
            <Text style={styles.error}>Enter an email and password to continue.</Text>
          )}

          <Pressable onPress={handleLogin} style={styles.buttonWrap}>
            <LinearGradient
              colors={["#FF6485", "#ED3D69"]}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Start discovering</Text>
              <Text style={styles.arrow}>{"->"}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <Text style={styles.note}>
          Demo mode: any email and password will work.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#090B10",
    flex: 1,
    overflow: "hidden",
  },
  glowTop: {
    backgroundColor: "rgba(255, 79, 117, 0.10)",
    borderRadius: 180,
    height: 360,
    position: "absolute",
    right: -190,
    top: -150,
    width: 360,
  },
  glowBottom: {
    backgroundColor: "rgba(118, 77, 255, 0.07)",
    borderRadius: 160,
    bottom: -180,
    height: 320,
    left: -170,
    position: "absolute",
    width: 320,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logo: {
    alignSelf: "center",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 25,
    borderWidth: 1,
    padding: 5,
  },
  logoGradient: {
    alignItems: "center",
    borderRadius: 20,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -2,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginTop: 22,
    textAlign: "center",
  },
  tagline: {
    color: "#858A96",
    fontSize: 14,
    marginTop: 7,
    textAlign: "center",
  },
  form: {
    marginTop: 44,
  },
  label: {
    color: "#9A9FAA",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 9,
  },
  passwordLabel: {
    marginTop: 19,
  },
  input: {
    backgroundColor: "#14171E",
    borderColor: "#282C36",
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
    marginTop: 12,
  },
  buttonWrap: {
    borderRadius: 17,
    marginTop: 25,
    overflow: "hidden",
  },
  button: {
    alignItems: "center",
    borderRadius: 17,
    flexDirection: "row",
    height: 57,
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 17,
    marginLeft: 10,
  },
  note: {
    bottom: 30,
    color: "#555B67",
    fontSize: 11,
    left: 0,
    position: "absolute",
    right: 0,
    textAlign: "center",
  },
});
