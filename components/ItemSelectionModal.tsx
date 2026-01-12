import { ThemedText } from "@/components/themed-text";
import { useGetInventoryQuery } from "@/redux/products/apiSlice";
import { Category, Item } from "@/redux/products/types";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface ItemSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: Item, quantity: number) => void;
  title: string;
  excludeItemIds?: number[];
  canAddExistingItems?: boolean;
}

export function ItemSelectionModal({
  visible,
  onClose,
  onSubmit,
  title,
  excludeItemIds = [],
  canAddExistingItems = false,
}: ItemSelectionModalProps) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);

  const { data: inventoryData, isLoading: inventoryLoading } =
    useGetInventoryQuery();

  // Get items for the selected category, filtering out excluded items unless canAddExistingItems is true
  const availableItems = selectedCategory
    ? inventoryData
        ?.find((cat) => cat.id === selectedCategory.id)
        ?.items.filter((item) =>
          canAddExistingItems ? true : !excludeItemIds.includes(item.id)
        ) || []
    : [];

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
    setItemQuantity(1);
  };

  const handleItemChange = (item: Item) => {
    setSelectedItem(item);
    setItemQuantity(1);
  };

  const handleSubmit = () => {
    if (selectedItem) {
      onSubmit(selectedItem, itemQuantity);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedCategory(undefined);
    setSelectedItem(null);
    setItemQuantity(1);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>{title}</ThemedText>
          </View>

          {inventoryLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText style={styles.loadingText}>
                {t("history.loadingInventory")}
              </ThemedText>
            </View>
          ) : (
            <ScrollView style={styles.modalBody}>
              {/* Category Selection */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  {t("history.selectCategory")}
                </ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {inventoryData?.map((category: Category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        selectedCategory?.id === category.id &&
                          styles.categoryOptionSelected,
                      ]}
                      onPress={() => handleCategoryChange(category)}
                    >
                      <ThemedText
                        style={[
                          styles.categoryOptionText,
                          selectedCategory?.id === category.id &&
                            styles.categoryOptionTextSelected,
                        ]}
                      >
                        {category.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Item Selection */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  {t("history.selectItem")}
                </ThemedText>
                <ScrollView
                  style={styles.itemScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {availableItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemOption,
                        selectedItem?.id === item.id &&
                          styles.itemOptionSelected,
                      ]}
                      onPress={() => handleItemChange(item)}
                      disabled={!selectedCategory}
                    >
                      <ThemedText
                        style={[
                          styles.itemOptionText,
                          selectedItem?.id === item.id &&
                            styles.itemOptionTextSelected,
                          !selectedCategory && styles.itemOptionDisabled,
                        ]}
                      >
                        {item.name} ({item.quantity} {item.type_of_unit})
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                  {!selectedCategory && (
                    <ThemedText style={styles.disabledText}>
                      {t("history.selectCategoryFirst")}
                    </ThemedText>
                  )}
                  {selectedCategory && availableItems.length === 0 && (
                    <ThemedText style={styles.disabledText}>
                      {t("history.allItemsAdded")}
                    </ThemedText>
                  )}
                </ScrollView>
              </View>

              {/* Quantity Selection */}
              {selectedItem && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>
                    {t("history.selectQuantity")}
                  </ThemedText>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        setItemQuantity(Math.max(1, itemQuantity - 1))
                      }
                    >
                      <ThemedText style={styles.quantityButtonText}>
                        -
                      </ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={styles.quantityValue}>
                      {itemQuantity}
                    </ThemedText>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        setItemQuantity(
                          Math.min(selectedItem.quantity, itemQuantity + 1)
                        )
                      }
                    >
                      <ThemedText style={styles.quantityButtonText}>
                        +
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={styles.availableText}>
                    {t("history.available", {
                      quantity: selectedItem.quantity,
                      unit: selectedItem.type_of_unit,
                    })}
                  </ThemedText>
                </View>
              )}
            </ScrollView>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <ThemedText style={styles.cancelButtonText}>
                {t("history.cancel")}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedItem || !selectedCategory) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedItem || !selectedCategory}
            >
              <ThemedText style={styles.submitButtonText}>
                {t("history.addItemButton")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  modalBody: {
    maxHeight: 500,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: "row",
  },
  categoryOption: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  categoryOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoryOptionTextSelected: {
    color: "white",
  },
  itemScroll: {
    maxHeight: 200,
  },
  itemOption: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  itemOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  itemOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  itemOptionTextSelected: {
    color: "white",
  },
  itemOptionDisabled: {
    color: "#999",
  },
  disabledText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 12,
  },
  quantityButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    minWidth: 40,
    textAlign: "center",
  },
  availableText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
