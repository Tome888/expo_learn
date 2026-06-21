import React from "react";
import { ThemeProvider as AppThemeProvider } from "@/context/ThemeContext";
import TabLayout from "@/components/app-tabs";
import { SQLiteProvider } from "expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { CREATE_USER } from "@/queries";
import UserFound from "@/components/UserFound";

export default function RootLayout() {
  const initializeDatabase = async (db: SQLiteDatabase) => {
    try {
      console.log("Initializing database tables...");
      await db.execAsync(CREATE_USER);
      console.log("Database initialized successfully.");
    } catch (error) {
      console.error("Database initialization failed:", error);
    }
  };

  return (
    <SQLiteProvider databaseName="nomadSync.db" onInit={initializeDatabase}>
      <AppThemeProvider>
        {/*<TabLayout />;*/}
        <UserFound />
      </AppThemeProvider>
    </SQLiteProvider>
  );
}
