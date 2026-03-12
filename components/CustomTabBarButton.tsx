import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import React from "react";
import { StyleSheet, View } from "react-native";

export function CustomTabBarButton(props: BottomTabBarButtonProps) {
  const colorScheme = useColorScheme();
  const isSelected = props.accessibilityState?.selected;

  return (
    <PlatformPressable {...props} style={[styles.container, props.style]}>
      <View
        style={[
          styles.button,
          {
            backgroundColor: isSelected
              ? Colors[colorScheme ?? "light"].tint
              : "#007AFF",
            shadowColor: Colors[colorScheme ?? "light"].text,
          },
        ]}
      >
        {props.children}
      </View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    top: -30,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    height: 60,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
});
