import React from "react";
import { Text, StyleSheet, Platform } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

export type ThemedTextProps = {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "code"
    | "small";
  style?: any;
  children?: React.ReactNode;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const { isDark } = useAppTheme();

  // Dynamic text color calculation bypassing the hook dependency
  const textColor = isDark ? darkColor || "#ffffff" : lightColor || "#000000";

  return (
    <Text
      style={[
        { color: textColor },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "code" ? styles.code : undefined,
        type === "small" ? styles.small : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24 },
  defaultSemiBold: { fontSize: 16, lineHeight: 24, fontWeight: "600" },
  title: { fontSize: 32, fontWeight: "bold", lineHeight: 40 },
  subtitle: { fontSize: 20, fontWeight: "bold" },
  link: { lineHeight: 30, fontSize: 16, color: "#0a7ea4" },
  code: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 4,
    borderRadius: 4,
  },
  small: { fontSize: 12, lineHeight: 16, opacity: 0.7 },
});
