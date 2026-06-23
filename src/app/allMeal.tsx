import React, { useState, useCallback } from "react";
import {
  Platform,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  View,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { Post } from "@/types/posts";

export default function AllMeals() {
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();

  const [favoritePosts, setFavoritePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Queries the database for favorites
  const loadFavorites = useCallback(async () => {
    try {
      // Ensure the favorite_posts table exists
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS favorite_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL
        );
      `);

      // Query all saved columns from the local database
      const savedRows = await db.getAllAsync<Post>(
        "SELECT id, userId, title, body FROM favorite_posts;",
      );

      setFavoritePosts(savedRows);
    } catch (error) {
      console.error("Error loading sqlite favorites in AllMeals:", error);
    }
  }, [db]);

  // Triggers automatically EVERY time the user navigates into this screen tab
  useFocusEffect(
    useCallback(() => {
      async function syncFocusData() {
        await loadFavorites();
        setLoading(false);
      }
      syncFocusData();
    }, [loadFavorites]),
  );

  // Still support pulling down manually if desired
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  // Remove a card from favorites directly and instantly filter the UI view array
  const removeFavorite = async (postId: number) => {
    try {
      await db.runAsync("DELETE FROM favorite_posts WHERE id = ?;", [postId]);

      // Instantly update the UI list by filtering out the removed item
      setFavoritePosts((prevRows) =>
        prevRows.filter((post) => post.id !== postId),
      );
    } catch (error) {
      console.error("Database deletion operation failed in AllMeals:", error);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={favoritePosts}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
        ListHeaderComponent={
          <ThemedText type="title" style={styles.title}>
            FAVORITED MEALS
          </ThemedText>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={48} color="#8E8E93" />
            <ThemedText style={styles.emptyText}>
              No favorited meals found yet. Tap hearts on the main screen to
              save them here!
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <ThemedView style={styles.postCard}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle" style={styles.postTitle}>
                {item.title}
              </ThemedText>

              <TouchableOpacity
                onPress={() => removeFavorite(item.id)}
                style={styles.favoriteButton}
                activeOpacity={0.7}
              >
                <Ionicons name="heart" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.postBody}>{item.body}</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  postCard: {
    padding: Spacing.four,
    borderRadius: 16,
    marginBottom: Spacing.three,
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth,
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(128, 128, 128, 0.15)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  postTitle: {
    flex: 1,
    textAlign: "left",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  favoriteButton: {
    paddingLeft: Spacing.two,
    paddingBottom: Spacing.two,
  },
  postBody: {
    textAlign: "left",
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
  scrollContent: {
    alignItems: "stretch",
    paddingHorizontal: Spacing.four,
  },
  title: {
    textAlign: "left",
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth,
    fontSize: 28,
    fontWeight: "800",
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 15,
    opacity: 0.6,
    lineHeight: 22,
  },
});
