import { ThemedText } from "@/components/themed-text";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Slider } from "@/components/ui/Slider";
import { useToast } from "@/contexts/ToastContext";
import { useApiError } from "@/hooks/use-api-error";
import {
  useCreateItemMutation,
  useDeleteItemMutation,
  useUpdateItemQuantityMutation,
} from "@/redux/products/apiSlice";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface ManualEntryButtonProps {
  inventoryData: any[];
}

export function ManualEntryButton({ inventoryData }: ManualEntryButtonProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { showError } = useApiError();
  const [updateItemQuantity] = useUpdateItemQuantityMutation();
  const [createItem] = useCreateItemMutation();
  const [deleteItem] = useDeleteItemMutation();

  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [isBuying, setIsBuying] = useState(true);
  const [selectedManualCategory, setSelectedManualCategory] = useState("");
  const [selectedManualItem, setSelectedManualItem] = useState("");
  const [quantityToSell, setQuantityToSell] = useState(0);

  const manualCategoryItems = selectedManualCategory
    ? inventoryData.find((cat) => cat.name === selectedManualCategory)?.items ||
      []
    : [];

  const hasItems = inventoryData.some(
    (cat) => cat.items && cat.items.length > 0
  );

  const selectedItemQuantity = selectedManualItem
    ? inventoryData
        .find((cat) => cat.name === selectedManualCategory)
        ?.items.find((item) => item.name === selectedManualItem)?.quantity || 0
    : 0;

  useEffect(() => {
    if (
      !isBuying &&
      selectedManualItem &&
      quantityToSell > selectedItemQuantity
    ) {
      setQuantityToSell(selectedItemQuantity);
    }
  }, [isBuying, selectedManualItem, selectedItemQuantity, quantityToSell]);

  const handleToggleChange = (newIsBuying: boolean) => {
    setIsBuying(newIsBuying);
  };

  const resetModalState = () => {
    setSelectedManualCategory("");
    setSelectedManualItem("");
    setQuantityToSell(0);
    setIsBuying(true);
  };

  const handleCloseModal = () => {
    setShowManualEntryModal(false);
    resetModalState();
  };

  const handleManualEntrySubmit = async () => {
    if (selectedManualCategory && selectedManualItem) {
      const category = inventoryData.find(
        (cat) => cat.name === selectedManualCategory
      );
      const existingItem = category?.items.find(
        (item) => item.name === selectedManualItem
      );

      try {
        if (isBuying) {
          const buyQuantity = quantityToSell || 1;
          if (existingItem) {
            // Use the quantity endpoint to increment
            await updateItemQuantity({
              id: existingItem.id,
              quantity: buyQuantity,
            }).unwrap();
          } else {
            const categoryId = category?.id;
            if (!categoryId) {
              Alert.alert(
                t("inventoryEdit.error"),
                t("inventoryEdit.selectedCategoryNotFound")
              );
              return;
            }
            await createItem({
              name: selectedManualItem,
              quantity: buyQuantity,
              type_of_unit: "unit",
              category_id: categoryId,
            }).unwrap();
          }
        } else {
          if (existingItem) {
            const sellQuantity = quantityToSell || 1;

            if (existingItem.quantity >= sellQuantity) {
              if (existingItem.quantity === sellQuantity) {
                await deleteItem(existingItem.id).unwrap();
              } else {
                // Use the quantity endpoint to decrement (negative value)
                await updateItemQuantity({
                  id: existingItem.id,
                  quantity: -sellQuantity,
                }).unwrap();
              }
            } else {
              Alert.alert(
                t("inventoryEdit.error"),
                t("inventoryEdit.cannotSellQuantity", {
                  sellQuantity,
                  availableQuantity: existingItem.quantity,
                })
              );
              return;
            }
          } else {
            Alert.alert(
              t("inventoryEdit.error"),
              t("inventoryEdit.itemNotFoundInInventory")
            );
            return;
          }
        }

        handleCloseModal();
        showToast(t("inventoryEdit.inventoryUpdated"), "success");
      } catch (error) {
        showError(error, t("inventoryEdit.failedToProcessManualEntry"));
      }
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.manualEntryButton,
          !hasItems && styles.manualEntryButtonDisabled,
        ]}
        onPress={() => setShowManualEntryModal(true)}
        disabled={!hasItems}
      >
        <ThemedText style={styles.manualEntryButtonText}>
          {t("inventoryEdit.manualEntry")}
        </ThemedText>
      </TouchableOpacity>

      <Modal
        visible={showManualEntryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View>
                <Slider
                  value={isBuying}
                  onValueChange={handleToggleChange}
                  leftLabel={t("inventoryEdit.buying")}
                  rightLabel={t("inventoryEdit.selling")}
                  leftColor="#007AFF"
                  rightColor="#FF3B30"
                />
              </View>

              {/* Breadcrumb - shown when category or item is selected */}
              {selectedManualCategory && (
                <View style={styles.breadcrumbContainer}>
                  <Breadcrumb
                    items={[
                      {
                        label: selectedManualCategory,
                        onPress: () => {
                          setSelectedManualCategory("");
                          setSelectedManualItem("");
                        },
                        showCloseIcon: true,
                      },
                      ...(selectedManualItem
                        ? [
                            {
                              label: selectedManualItem,
                              onPress: () => {
                                setSelectedManualItem("");
                              },
                              showCloseIcon: true,
                            },
                          ]
                        : []),
                    ]}
                  />
                </View>
              )}

              {/* Category Section - hidden when category is selected */}
              {!selectedManualCategory && (
                <View>
                  <ThemedText style={styles.modalSectionTitle}>
                    {t("inventoryEdit.category")}
                  </ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.modalScroll}
                  >
                    {inventoryData
                      .filter(
                        (category) =>
                          category.items && category.items.length > 0
                      )
                      .map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.modalOption,
                            selectedManualCategory === category.name &&
                              styles.modalOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedManualCategory(category.name);
                            setSelectedManualItem("");
                          }}
                        >
                          <ThemedText
                            style={[
                              styles.modalOptionText,
                              selectedManualCategory === category.name &&
                                styles.modalOptionTextSelected,
                            ]}
                          >
                            {category.name}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </View>
              )}

              {/* Item Section - shown when category is selected but item is not */}
              {selectedManualCategory && !selectedManualItem && (
                <View>
                  <ThemedText style={styles.modalSectionTitle}>
                    {t("inventoryEdit.item")}
                  </ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.modalScroll}
                  >
                    {manualCategoryItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.modalOption,
                          selectedManualItem === item.name &&
                            styles.modalOptionSelected,
                        ]}
                        onPress={() => setSelectedManualItem(item.name)}
                      >
                        <ThemedText
                          style={[
                            styles.modalOptionText,
                            selectedManualItem === item.name &&
                              styles.modalOptionTextSelected,
                          ]}
                        >
                          {item.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.quantitySection}>
                {selectedManualItem ? (
                  <>
                    <ThemedText style={styles.inventoryInfoText}>
                      {t("inventoryEdit.available", {
                        quantity: selectedItemQuantity,
                        unit:
                          inventoryData
                            .find((cat) => cat.name === selectedManualCategory)
                            ?.items.find(
                              (item) => item.name === selectedManualItem
                            )?.type_of_unit || "units",
                      })}
                    </ThemedText>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          quantityToSell <= 0 && styles.quantityButtonDisabled,
                        ]}
                        onPress={() =>
                          setQuantityToSell(Math.max(0, quantityToSell - 1))
                        }
                        disabled={quantityToSell <= 0}
                      >
                        <ThemedText style={styles.quantityButtonText}>
                          -
                        </ThemedText>
                      </TouchableOpacity>

                      <View style={styles.quantityDisplay}>
                        <ThemedText style={styles.quantityText}>
                          {quantityToSell}
                        </ThemedText>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          !isBuying &&
                            quantityToSell >= selectedItemQuantity &&
                            styles.quantityButtonDisabled,
                        ]}
                        onPress={() =>
                          setQuantityToSell(
                            isBuying
                              ? quantityToSell + 1
                              : Math.min(
                                  selectedItemQuantity,
                                  quantityToSell + 1
                                )
                          )
                        }
                        disabled={
                          !isBuying && quantityToSell >= selectedItemQuantity
                        }
                      >
                        <ThemedText style={styles.quantityButtonText}>
                          +
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  (!selectedManualCategory || !selectedManualItem) &&
                    styles.modalSubmitButtonDisabled,
                ]}
                onPress={handleManualEntrySubmit}
                disabled={!selectedManualCategory || !selectedManualItem}
              >
                <ThemedText style={styles.modalSubmitButtonText}>
                  {t("inventoryEdit.submit")}
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  manualEntryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  manualEntryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  manualEntryButtonDisabled: {
    backgroundColor: "#A0A0A0",
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    padding: 8,
  },
  breadcrumbContainer: {
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 16,
  },
  modalScroll: {
    maxHeight: 120,
  },
  modalOption: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  modalOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  modalOptionTextSelected: {
    color: "white",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleContainerBuying: {
    backgroundColor: "#E3F2FD",
  },
  toggleContainerSelling: {
    backgroundColor: "#FFEBEE",
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  inventoryInfoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  quantitySection: {
    marginTop: -12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  quantityButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  quantityDisplay: {
    marginHorizontal: 24,
    minWidth: 60,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  sliderHelpText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  modalSubmitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 40,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  modalSubmitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
