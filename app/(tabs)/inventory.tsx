import { Inventory } from "@/components/inventory/Inventory";
import { ManualEntryButton } from "@/components/ManualEntryButton";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGetInventoryQuery } from "@/redux/products/apiSlice";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export default function InventoryScreen() {
  const { t } = useTranslation();

  const { data: inventoryData = [], isLoading, error } = useGetInventoryQuery();
  console.log("inventoryData", inventoryData);
  console.log("is loading inventory", isLoading);
  console.log('err: ', error)

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {t("inventory.title")}
        </ThemedText>
      </View>

      {/* Manual Entry Button */}
      <View style={styles.buttonContainer}>
        <ManualEntryButton inventoryData={inventoryData} />
      </View>

      {/* Inventory Content */}
      <View style={styles.scrollContainer}>
        <Inventory
          inventoryData={inventoryData}
          isLoading={isLoading}
          error={!!error}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
