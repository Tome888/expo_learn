import React from "react";
import { View } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

export type ThemedViewProps = {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "backgroundElement";
  style?: any;
  children?: React.ReactNode;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...otherProps
}: ThemedViewProps) {
  const { isDark } = useAppTheme();

  // 1. Fallback priority checks:
  // Custom props passed directly to component take first priority.
  // Otherwise, fallback to standard dark/light design system defaults.
  let backgroundColor = isDark
    ? darkColor || "#121212"
    : lightColor || "#ffffff";

  // 2. If it's a step container card layout highlight element, give it distinct panel contrast
  if (type === "backgroundElement") {
    backgroundColor = isDark ? "#1C1C1E" : "#F2F2F7";
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
