import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export interface BreadcrumbItem {
  label: string;
  onPress?: () => void;
  showCloseIcon?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
}

export function Breadcrumb({ items, separator }: BreadcrumbProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <View key={index} style={styles.itemContainer}>
            {item.onPress ? (
              <TouchableOpacity onPress={item.onPress} style={styles.touchable}>
                <ThemedText style={styles.clickableText}>
                  {item.label}
                </ThemedText>
                {item.showCloseIcon && (
                  <IconSymbol
                    name="xmark"
                    size={14}
                    color="#007AFF"
                    style={styles.closeIcon}
                  />
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.textContainer}>
                <ThemedText
                  style={isLast ? styles.currentText : styles.inactiveText}
                >
                  {item.label}
                </ThemedText>
                {item.showCloseIcon && (
                  <IconSymbol
                    name="xmark"
                    size={14}
                    color={isLast ? "#333" : "#666"}
                    style={styles.closeIcon}
                  />
                )}
              </View>
            )}

            {!isLast && separator && (
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
    gap: 4
  },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  touchable: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clickableText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  closeIcon: {
    marginLeft: 6,
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
