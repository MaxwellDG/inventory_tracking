import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Category, Item } from "@/redux/products/types";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface InventoryProps {
  inventoryData: Category[];
  isLoading: boolean;
  error: boolean;
}

export function Inventory({ inventoryData, isLoading, error }: InventoryProps) {
  const { t } = useTranslation();

  // Initialize expanded sections based on categories from inventoryData
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>(() => {
    const initialSections: { [key: string]: boolean } = {};
    inventoryData.forEach((category) => {
      initialSections[category.name] = false;
    });
    return initialSections;
  });

  // Update expanded sections when categories change
  useEffect(() => {
    setExpandedSections((prev) => {
      const newSections = { ...prev };
      inventoryData.forEach((category) => {
        if (!(category.name in newSections)) {
          newSections[category.name] = false; // New categories start closed
        }
      });
      return newSections;
    });
  }, [inventoryData]);

  const toggleSection = (category: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Create grouped items from inventoryData
  const groupedItems = inventoryData.reduce((acc, category) => {
    acc[category.name] = category.items;
    return acc;
  }, {} as { [key: string]: Item[] });

  const renderInventoryItem = ({ item }: { item: Item }) => (
    <ThemedView style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.itemQuantity}>
          {item.quantity} {item.type_of_unit}
        </ThemedText>
      </View>
    </ThemedView>
  );

  const renderCategorySection = (category: string, items: Item[]) => {
    const isExpanded = expandedSections[category];
    const itemCount = items.length;

    return (
      <ThemedView key={category} style={styles.categorySection}>
        <TouchableOpacity
          style={[
            styles.categoryHeader,
            isExpanded && styles.categoryHeaderExpanded,
          ]}
          onPress={() => toggleSection(category)}
        >
          <View style={styles.categoryHeaderLeft}>
            <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
            <ThemedText style={styles.categoryCount}>
              ({t("inventory.itemsCount", { count: itemCount })})
            </ThemedText>
          </View>
          <IconSymbol
            name={isExpanded ? "chevron.up" : "chevron.down"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.categoryContent}>
            {items.map((item) => (
              <View key={item.id}>{renderInventoryItem({ item })}</View>
            ))}
          </View>
        )}
      </ThemedView>
    );
  };

  return (
    <View style={styles.accordionContainer}>
      {isLoading ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>
            {t("inventory.loading")}
          </ThemedText>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>
            {t("inventory.error")}
          </ThemedText>
        </View>
      ) : (
        Object.entries(groupedItems).map(([category, items]) =>
          renderCategorySection(category, items)
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  accordionContainer: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  categoryHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginRight: 8,
  },
  categoryCount: {
    fontSize: 14,
    color: "#666",
  },
  categoryContent: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    flexShrink: 1,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
    flexShrink: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});
