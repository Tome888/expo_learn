import React from "react";
import { ThemeProvider as AppThemeProvider } from "@/context/ThemeContext";
import TabLayout from "@/components/app-tabs";

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <TabLayout />
    </AppThemeProvider>
  );
}
