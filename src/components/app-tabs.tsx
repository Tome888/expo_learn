import React from "react";
import { Tabs } from "expo-router";
import { ActionSheetIOS, Alert, Platform, StyleSheet } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as ExpoBlur from "expo-blur";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// Import our new global hook
import { useAppTheme } from "@/context/ThemeContext";

export default function TabLayout() {
  // Read our global contextual states
  const { themePreference, setThemePreference, isDark } = useAppTheme();

  const activeTintColor = isDark ? "#fff" : "#007AFF";
  const inactiveTintColor = "#8E8E93";
  const iconHeaderColor = isDark ? "#fff" : "#007AFF";

  const handleSettingsPress = () => {
    const currentThemeLabel =
      themePreference === "system"
        ? "System Default"
        : themePreference === "dark"
          ? "Dark Mode"
          : "Light Mode";

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Cancel",
            "Account Profile",
            `Change Theme (Current: ${currentThemeLabel})`,
            "Log Out",
          ],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
          title: "App Quick Actions",
        },
        (buttonIndex: number) => {
          if (buttonIndex === 1) console.log("Profile Tapped");
          if (buttonIndex === 2) {
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: [
                  "Cancel",
                  "Use System Default",
                  "Force Light Mode",
                  "Force Dark Mode",
                ],
                cancelButtonIndex: 0,
                title: "Select Display Theme",
              },
              (themeIndex: number) => {
                if (themeIndex === 1) setThemePreference("system");
                if (themeIndex === 2) setThemePreference("light");
                if (themeIndex === 3) setThemePreference("dark");
              },
            );
          }
          if (buttonIndex === 3) console.log("Logged Out");
        },
      );
    } else {
      Alert.alert(
        "Quick Settings",
        `Current Theme: ${currentThemeLabel}\nSelect an option:`,
        [
          {
            text: "Log Out",
            onPress: () => console.log("Logged Out"),
            style: "destructive",
          },
          {
            text: "Switch Theme Mode",
            onPress: () => {
              Alert.alert("Select Theme", "Choose a presentation style:", [
                {
                  text: "System Default",
                  onPress: () => setThemePreference("system"),
                },
                {
                  text: "Light Mode",
                  onPress: () => setThemePreference("light"),
                },
                {
                  text: "Dark Mode",
                  onPress: () => setThemePreference("dark"),
                },
              ]);
            },
          },
          { text: "Close", style: "cancel" },
        ],
      );
    }
  };

  const BlurViewComponent = ExpoBlur?.BlurView;

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} animated={true} />

      {typeof AnimatedSplashOverlay !== "undefined" ? (
        <AnimatedSplashOverlay />
      ) : null}

      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#121212" : "#fff" },
          headerTintColor: iconHeaderColor,
          headerRightContainerStyle: { paddingRight: 16 },
          headerTitleAlign: Platform.OS === "android" ? "left" : "center",
          tabBarActiveTintColor: activeTintColor,
          tabBarInactiveTintColor: inactiveTintColor,
          sceneStyle: { backgroundColor: "transparent" },
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
              borderTopWidth: 0,
              backgroundColor: "transparent",
              elevation: 0,
            },
            android: {
              backgroundColor: isDark ? "#121212" : "#fff",
              elevation: 8,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: isDark ? "#2C2C2E" : "#E5E5EA",
            },
          }),
          tabBarBackground:
            Platform.OS === "ios" && BlurViewComponent
              ? () => (
                  <BlurViewComponent
                    intensity={80}
                    tint={isDark ? "dark" : "light"}
                    style={StyleSheet.absoluteFill}
                  />
                )
              : undefined,
          headerRight: () => (
            <Ionicons
              name="settings-outline"
              size={24}
              color={iconHeaderColor}
              onPress={() => handleSettingsPress()}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="addMeal"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={24}
                color={color}
              />
            ),
            title: "Add Meal",
          }}
        />
        <Tabs.Screen
          name="allMeal"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "list" : "list-outline"}
                size={24}
                color={color}
              />
            ),
            title: "All Meals",
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
