import {
  DarkTheme,
  DefaultTheme,
  router,
  Tabs,
  ThemeProvider,
} from "expo-router";
import { ActionSheetIOS, Alert, Platform, useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Ionicons } from "@expo/vector-icons";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  const handleSettingsPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Account Profile", "Toggle Premium", "Log Out"],
          destructiveButtonIndex: 3,
          cancelButtonIndex: 0,
          title: "App Quick Actions",
        },
        (buttonIndex) => {
          if (buttonIndex === 1) console.log("Profile Tapped");
          if (buttonIndex === 3) console.log("Logged Out");
        },
      );
    } else {
      Alert.alert("Quick Settings", "Select an option:", [
        {
          text: "Log Out",
          onPress: () => console.log("Logged Out"),
          style: "destructive",
        },
        {
          text: "Account Settings",
          onPress: () => console.log("Navigating..."),
        },
        { text: "Close", style: "cancel" },
      ]);
    }
  };
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#121212" : "#fff",
          },

          headerRightContainerStyle: {
            paddingRight: 16,
          },
          headerTitleAlign: "center",

          headerRight: () => (
            <Ionicons
              name="settings"
              size={24}
              color="black"
              onPress={() => {
                console.log("setting are open");
                handleSettingsPress();
              }}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: () => <Ionicons name="home" size={24} color="black" />,
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="addMeal"
          options={{
            tabBarIcon: () => (
              <Ionicons name="add-circle" size={24} color="black" />
            ),
            title: "Add Meal",
          }}
        />
        <Tabs.Screen
          name="allMeal"
          options={{
            tabBarIcon: () => <Ionicons name="list" size={24} color="black" />,
            title: "All Meals",
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
