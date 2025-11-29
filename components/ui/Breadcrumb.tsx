import { ThemedText } from "@/components/themed-text";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export interface BreadcrumbItem {
  label: string;
  onPress?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
}

export function Breadcrumb({ items, separator = ">" }: BreadcrumbProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <View key={index} style={styles.itemContainer}>
            {item.onPress && !isLast ? (
              <TouchableOpacity onPress={item.onPress}>
                <ThemedText style={styles.clickableText}>
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <ThemedText
                style={isLast ? styles.currentText : styles.inactiveText}
              >
                {item.label}
              </ThemedText>
            )}

            {!isLast && (
              <ThemedText style={styles.separator}>{separator}</ThemedText>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clickableText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  currentText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  inactiveText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  separator: {
    fontSize: 14,
    color: "#999",
    marginHorizontal: 8,
  },
});

