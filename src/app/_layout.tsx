import React from "react";
import { ThemeProvider as AppThemeProvider } from "@/context/ThemeContext";
import { SQLiteProvider } from "expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { CREATE_USER, FAVORITE_POSTS } from "@/queries";
import UserFound from "@/components/UserFound";

export default function RootLayout() {
  const initializeDatabase = async (db: SQLiteDatabase) => {
    try {
      console.log("Initializing database tables...");
      await db.execAsync("PRAGMA journal_mode = WAL;");

      await db.execAsync(CREATE_USER);
      await db.execAsync(FAVORITE_POSTS);

      console.log("Database initialized successfully.");
    } catch (error) {
      console.error("Database initialization failed:", error);
    }
  };

  return (
    <SQLiteProvider databaseName="nomadSync.db" onInit={initializeDatabase}>
      <AppThemeProvider>
        <UserFound />
      </AppThemeProvider>
    </SQLiteProvider>
  );
}

// =======DROP ALL TABLES===========
// import React from "react";
// import { ThemeProvider as AppThemeProvider } from "@/context/ThemeContext";
// import { SQLiteProvider } from "expo-sqlite";
// import { SQLiteDatabase } from "expo-sqlite";
// import { CREATE_USER } from "@/queries";
// import UserFound from "@/components/UserFound";

// export default function RootLayout() {
//   const initializeDatabase = async (db: SQLiteDatabase) => {
//     try {
//       console.log("Resetting database: Dropping existing tables...");

//       // 1. Drop the user table if it already exists to start fresh
//       await db.execAsync("DROP TABLE IF EXISTS user;");
//       console.log("Tables dropped successfully.");

//       // 2. Re-create the user table structure using your predefined query
//       console.log("Initializing fresh database tables...");
//       await db.execAsync(CREATE_USER);
//       console.log("Database initialized successfully from scratch.");
//     } catch (error) {
//       console.error("Database initialization / reset failed:", error);
//     }
//   };

//   return (
//     <SQLiteProvider databaseName="nomadSync.db" onInit={initializeDatabase}>
//       <AppThemeProvider>
//         <UserFound />
//       </AppThemeProvider>
//     </SQLiteProvider>
//   );
// }
