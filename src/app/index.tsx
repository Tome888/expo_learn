import {
  Platform,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { Post } from "@/types/posts";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();

  const [posts, setPosts] = useState<Post[]>([]);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Fires every single time this screen comes into active focus
  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        try {
          // Safety Fallback: Ensure table exists
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS favorite_posts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              userId INTEGER NOT NULL,
              title TEXT NOT NULL,
              body TEXT NOT NULL
            );
          `);

          // 1. Fetch posts from API
          const response = await fetch(
            "https://jsonplaceholder.typicode.com/posts",
          );
          const apiPosts = await response.json();
          setPosts(apiPosts);

          // 2. Query saved posts from your SQLite database
          const savedFavorites = await db.getAllAsync<{ id: number }>(
            "SELECT id FROM favorite_posts;",
          );

          // Map the IDs to an easy lookup dictionary: { [postId]: true }
          const favMap: Record<number, boolean> = {};
          savedFavorites.forEach((fav) => {
            favMap[fav.id] = true;
          });
          setFavorites(favMap);
        } catch (error) {
          console.error("Error loading data on Home focus:", error);
        } finally {
          setLoading(false);
        }
      }

      loadData();
    }, [db]),
  );

  // Toggle favorite execution inside SQLite
  const toggleFavorite = async (item: Post) => {
    const isFav = !!favorites[item.id];

    try {
      if (isFav) {
        await db.runAsync("DELETE FROM favorite_posts WHERE id = ?;", [
          item.id,
        ]);
        setFavorites((prev) => ({ ...prev, [item.id]: false }));
      } else {
        await db.runAsync(
          "INSERT INTO favorite_posts (id, userId, title, body) VALUES (?, ?, ?, ?);",
          [item.id, item.userId, item.title, item.body],
        );
        setFavorites((prev) => ({ ...prev, [item.id]: true }));
      }
    } catch (error) {
      console.error("Database updating operation failed:", error);
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
        data={posts}
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
        ListHeaderComponent={
          <ThemedText type="title" style={styles.title}>
            Welcome to Expo
          </ThemedText>
        }
        renderItem={({ item }) => {
          const isFavorited = !!favorites[item.id];
          return (
            <ThemedView style={styles.postCard}>
              <View style={styles.cardHeader}>
                <ThemedText type="subtitle" style={styles.postTitle}>
                  {item.title}
                </ThemedText>

                <TouchableOpacity
                  onPress={() => toggleFavorite(item)}
                  style={styles.favoriteButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isFavorited ? "heart" : "heart-outline"}
                    size={24}
                    color={isFavorited ? "#FF3B30" : "#8E8E93"}
                  />
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.postBody}>{item.body}</ThemedText>
            </ThemedView>
          );
        }}
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
});
