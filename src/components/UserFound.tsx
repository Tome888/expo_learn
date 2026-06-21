import User from "@/types/user";
import TabLayout from "./app-tabs";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

export default function UserFound() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const [viewState, setViewState] = useState<
    "onboarding" | "register_form" | "login_form"
  >("onboarding");

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const db = useSQLiteContext();

  const checkExistingUser = async () => {
    try {
      const result: any = await db.getFirstAsync(
        "SELECT * FROM user WHERE id = ?;",
        [1],
      );
      if (result) {
        handleBiometricAuth(result);
      } else {
        setUser(null);
        setViewState("onboarding");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkExistingUser();
  }, [db]);

  const handleBiometricAuth = async (targetUser: any) => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setViewState("login_form");
        return;
      }

      setIsAuthenticating(true);
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in to NomadSync",
        fallbackLabel: "Use Credentials",
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        setUser(targetUser);
      } else {
        setViewState("login_form");
      }
    } catch (error) {
      console.error("Biometric unlock crash:", error);
      setViewState("login_form");
    } finally {
      setIsAuthenticating(false);
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill out all identity credentials.");
      return;
    }

    try {
      setIsLoading(true);

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      let useBiometrics = 0;

      if (hasHardware && isEnrolled) {
        const confirmBiometrics = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "Biometrics Available",
            "Would you like to secure your account using FaceID / Fingerprint unlock?",
            [
              { text: "No", onPress: () => resolve(false), style: "cancel" },
              { text: "Yes, Enable", onPress: () => resolve(true) },
            ],
          );
        });

        if (confirmBiometrics) {
          const verifyResult = await LocalAuthentication.authenticateAsync({
            promptMessage: "Confirm your hardware identity",
          });
          if (verifyResult.success) {
            useBiometrics = 1;
          } else {
            Alert.alert(
              "Notice",
              "Biometric configuration canceled. Defaulting to manual verification fallback.",
            );
          }
        }
      }

      await SecureStore.setItemAsync("master_password", password.trim());

      await db.runAsync(
        "INSERT INTO user (id, name, is_biometric_enabled) VALUES (?, ?, ?);",
        [1, username.trim(), useBiometrics],
      );

      Alert.alert("Success", "Local security profile created successfully.");

      setUsername("");
      setPassword("");

      await checkExistingUser();
    } catch (error) {
      console.error("Failed to register account profile:", error);
      Alert.alert(
        "Registration Error",
        "Could not complete account setup configurations.",
      );
      setIsLoading(false);
    }
  };

  const handleManualLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(
        "Missing Fields",
        "Please enter both your username and password.",
      );
      return;
    }

    try {
      setIsLoading(true);
      const dbUser: any = await db.getFirstAsync(
        "SELECT * FROM user WHERE id = ?;",
        [1],
      );

      const savedPassword = await SecureStore.getItemAsync("master_password");

      if (
        dbUser &&
        dbUser.name === username.trim() &&
        savedPassword === password.trim()
      ) {
        setUser(dbUser);
      } else {
        Alert.alert(
          "Access Denied",
          "Incorrect username or master security key.",
        );
      }
    } catch (error) {
      console.error("Manual matching transaction failure:", error);
      Alert.alert("Error", "An unexpected security matching error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricRetry = async () => {
    try {
      const res: any = await db.getFirstAsync(
        "SELECT * FROM user WHERE id = ?;",
        [1],
      );
      if (res) {
        await handleBiometricAuth(res);
      } else {
        Alert.alert("Error", "No local profile found.");
      }
    } catch (error) {
      console.error("Failed executing biometric retry:", error);
    }
  };

  if (isLoading || isAuthenticating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Verifying secure containers...</Text>
      </View>
    );
  }

  if (user) {
    return <TabLayout />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.contentCard}>
          {viewState === "onboarding" && (
            <View style={styles.formWidth}>
              <View style={styles.iconPlaceholder}>
                <Text style={styles.iconText}>👋</Text>
              </View>
              <Text style={styles.title}>Welcome to NomadSync</Text>
              <Text style={styles.subtitle}>
                It looks like this is your first time here. Create a local
                account on this device to secure your data and begin your
                journey.
              </Text>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={() => setViewState("register_form")}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          )}

          {viewState === "register_form" && (
            <View style={styles.formWidth}>
              <Text style={styles.title}>Create Local Profile</Text>
              <Text style={styles.subtitle}>
                Set up keys to protect secure sandbox storage environments.
              </Text>

              <Text style={styles.label}>Profile Username</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. NomadExplorer"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Master Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={handleRegister}
              >
                <Text style={styles.buttonText}>Save Credentials</Text>
              </TouchableOpacity>
            </View>
          )}

          {viewState === "login_form" && (
            <View style={styles.formWidth}>
              <Text style={styles.title}>Device Locked</Text>
              <Text style={styles.subtitle}>
                Provide your master security credentials to unlock your profile
                records.
              </Text>

              <Text style={styles.label}>Profile Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Master Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={handleManualLogin}
              >
                <Text style={styles.buttonText}>Verify Security Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.biometricRetryLink}
                onPress={handleBiometricRetry}
              >
                <Text style={styles.biometricRetryLinkText}>
                  Retry Biometric Login (FaceID / TouchID)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 12,
  },
  contentCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  formWidth: {
    width: "100%",
    alignItems: "center",
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  label: {
    width: "100%",
    alignItems: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    textAlign: "left",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111827",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  button: {
    width: "100%",
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  biometricRetryLink: {
    marginTop: 20,
    padding: 10,
  },
  biometricRetryLinkText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
