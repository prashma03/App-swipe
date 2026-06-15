import Constants from "expo-constants";
import { Platform } from "react-native";

function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];

  // Expo supplies the current computer's LAN address to physical devices.
  if (expoHost && !expoHost.endsWith("exp.direct")) {
    return `http://${expoHost}:8000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://localhost:8000";
}

export const API_BASE_URL = getApiBaseUrl();

export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";
