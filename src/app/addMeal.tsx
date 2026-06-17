import React from "react";
import { Platform, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";

export default function AddMeal() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.three,
            paddingBottom:
              Platform.OS === "ios"
                ? insets.bottom + 90
                : insets.bottom + Spacing.three,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.innerContent}>
          <ThemedText type="title" style={styles.title}>
            ADD MEAL
          </ThemedText>

          {/* Your add meal form components go here */}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },
  innerContent: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: "transparent",
  },
  title: {
    textAlign: "center",
    marginTop: Spacing.four,
  },
});
