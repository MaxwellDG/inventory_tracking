import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export type DropdownItem = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  renderContent: () => React.ReactNode;
};

type EditSectionProps = {
  title: string;
  dropdownItems: DropdownItem[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
};

export function EditSection({
  title,
  dropdownItems,
  isExpanded,
  onToggleExpanded,
}: EditSectionProps) {
  return (
    <>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggleExpanded}>
        <ThemedText style={styles.sectionHeaderText}>{title}</ThemedText>
        <IconSymbol
          name={isExpanded ? "chevron.up" : "chevron.down"}
          size={24}
          color="#333"
        />
      </TouchableOpacity>

      {isExpanded &&
        dropdownItems.map((item, index) => (
          <ThemedView key={index} style={styles.dropdownSection}>
            <TouchableOpacity
              style={styles.dropdownHeader}
              onPress={item.onToggle}
            >
              <ThemedText style={styles.dropdownTitle}>{item.title}</ThemedText>
            </TouchableOpacity>

            {item.isOpen && (
              <View style={styles.dropdownContent}>{item.renderContent()}</View>
            )}
          </ThemedView>
        ))}
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dropdownSection: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  dropdownContent: {
    padding: 16,
  },
});
