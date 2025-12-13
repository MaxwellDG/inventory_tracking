import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function Paginator({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: PaginatorProps) {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canGoPrev && styles.buttonDisabled]}
        onPress={onPrevious}
        disabled={!canGoPrev}
      >
        <IconSymbol
          name="chevron.left"
          size={20}
          color={canGoPrev ? "#007AFF" : "#CCCCCC"}
        />
      </TouchableOpacity>

      <ThemedText style={styles.pageText}>
        {currentPage} of {totalPages}
      </ThemedText>

      <TouchableOpacity
        style={[styles.button, !canGoNext && styles.buttonDisabled]}
        onPress={onNext}
        disabled={!canGoNext}
      >
        <IconSymbol
          name="chevron.right"
          size={20}
          color={canGoNext ? "#007AFF" : "#CCCCCC"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#F8F8F8",
  },
  pageText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
