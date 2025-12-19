import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/contexts/ToastContext";
import { useGetFeesQuery } from "@/redux/fees/apiSlice";
import { useCreateOrderMutation } from "@/redux/orders/apiSlice";
import { useGetInventoryQuery } from "@/redux/products/apiSlice";
import { Category, Item } from "@/redux/products/types";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrdersScreen() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [pendingItems, setPendingItems] = useState<Item[]>([]);
  const { data: inventoryData, isLoading: inventoryLoading } =
    useGetInventoryQuery();
  const { data: fees = [] } = useGetFeesQuery();
  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();

  // Helper functions to work with inventory data
  const getItemsByCategory = (categoryId: number) => {
    if (!inventoryData) return [];
    const category = inventoryData.find((cat) => cat.id === categoryId);
    return category ? category.items : [];
  };

  const findItem = (itemId: number, categoryId: number) => {
    if (!inventoryData) return null;
    const category = inventoryData.find((cat) => cat.id === categoryId);
    if (!category) return null;
    return category.items.find((item) => item.id === itemId) || null;
  };

  // Get items for the selected category, filtering out items already in pending items
  const categoryItems = selectedCategory
    ? getItemsByCategory(selectedCategory.id).filter((item) => {
        // Check if this item is already in pending items
        return !pendingItems.some(
          (pendingItem: Item) =>
            pendingItem.id === item.id &&
            pendingItem.category_id === selectedCategory.id
        );
      })
    : [];

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setSelectedItem(null); // Clear item when category changes
    setOrderQuantity(1); // Reset quantity when category changes
  };

  const handleItemChange = (item: Item) => {
    setSelectedItem(item);
    setOrderQuantity(1); // Reset quantity when item changes
  };

  const handleSubmitItem = (item: Item) => {
    if (selectedCategory && selectedItem) {
      // Validate quantity doesn't exceed inventory
      if (orderQuantity > selectedItem.quantity) {
        Alert.alert(
          t("orders.error"),
          t("orders.cannotOrderQuantity", {
            orderQuantity,
            availableQuantity: selectedItem.quantity,
          })
        );
        return;
      }

      const newItem: Item = {
        id: selectedItem.id,
        name: selectedItem.name,
        category_id: selectedCategory.id,
        quantity: orderQuantity,
        type_of_unit: selectedItem.type_of_unit,
        price: selectedItem.price,
      };

      setPendingItems([...pendingItems, newItem]);
      setShowModal(false);
      setSelectedCategory(undefined);
      setSelectedItem(null);
      setOrderQuantity(1);
    } else {
      Alert.alert(t("orders.error"), t("orders.selectBothCategoryAndItem"));
    }
  };

  const handleDeleteItem = (itemId: number) => {
    setPendingItems(pendingItems.filter((item) => item.id !== itemId));
  };

  const handleClearAllItems = () => {
    setPendingItems([]);
    setShowClearModal(false);
  };

  // Calculate subtotal and total
  const calculateSubtotal = () => {
    return pendingItems.reduce((total, item) => {
      const itemPrice = item.price || 0;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Get applicable fees (applies_to === "order")
  const applicableFees = fees.filter((fee) => fee.applies_to === "order");

  // Calculate fee amounts
  const feeAmounts = applicableFees.map((fee) => ({
    id: fee.id,
    name: fee.name,
    percentage: fee.value,
    amount: subtotal * (fee.value / 100),
  }));

  // Calculate total with fees
  const totalFees = feeAmounts.reduce((sum, fee) => sum + fee.amount, 0);
  const total = subtotal + totalFees;

  const handleIncreaseQuantity = (itemId: number) => {
    setPendingItems((prevItems) =>
      prevItems.map((item: Item) => {
        if (item.id === itemId) {
          // Find the inventory item to check max quantity
          const inventoryItem = findItem(item.id, item.category_id);
          const maxQuantity = inventoryItem?.quantity || 0;
          const newQuantity = Math.min(maxQuantity, item.quantity + 1);

          if (newQuantity > item.quantity) {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      })
    );
  };

  const handleDecreaseQuantity = (itemId: number) => {
    setPendingItems(
      (prevItems) =>
        prevItems
          .map((item: Item) => {
            if (item.id === itemId) {
              const newQuantity = Math.max(1, item.quantity - 1);
              return { ...item, quantity: newQuantity };
            }
            return item;
          })
          .filter((item: Item) => item.quantity > 0) // Remove items with 0 quantity
    );
  };

  const SwipeableItemCard = ({
    item,
    index,
  }: {
    item: Item;
    index: number;
  }) => {
    const translateX = new Animated.Value(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSwiping, setIsSwiping] = useState(false);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 10
        );
      },
      onPanResponderGrant: () => {
        setIsSwiping(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsSwiping(false);
        if (gestureState.dx < -100) {
          // Swipe left far enough to trigger delete
          setIsDeleting(true);
          Animated.timing(translateX, {
            toValue: -400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleDeleteItem(item.id);
          });
        } else {
          // Snap back to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    return (
      <Animated.View
        style={[
          styles.orderCard,
          {
            transform: [{ translateX }],
            opacity: isDeleting ? 0.5 : 1,
            backgroundColor: isSwiping ? "#FFE6E6" : "white",
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View key={item.id} style={styles.orderItemRow}>
          <View style={styles.orderItemTop}>
            <ThemedText style={styles.orderItemName}>{item.name}</ThemedText>
            <View style={styles.orderQuantityControls}>
              <TouchableOpacity
                style={styles.orderQuantityButton}
                onPress={() => handleDecreaseQuantity(item.id)}
              >
                <ThemedText style={styles.orderQuantityButtonText}>
                  -
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.orderQuantityText}>
                {item.quantity}
              </ThemedText>
              <TouchableOpacity
                style={styles.orderQuantityButton}
                onPress={() => handleIncreaseQuantity(item.id)}
              >
                <ThemedText style={styles.orderQuantityButtonText}>
                  +
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>
              {t("orders.title")}
            </ThemedText>
            {pendingItems.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setShowClearModal(true)}
              >
                <ThemedText style={styles.clearText}>
                  {t("orders.clear")}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setShowModal(true)}
          >
            <IconSymbol name="plus" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
      >
        {pendingItems.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {t("orders.emptyState")}
            </ThemedText>
          </View>
        ) : (
          pendingItems.map((item, index) => (
            <SwipeableItemCard key={item.id} item={item} index={index} />
          ))
        )}
      </ScrollView>

      {/* Totals Container */}
      {pendingItems.length > 0 && (
        <View style={styles.totalsContainer}>
          <View style={styles.totalsRow}>
            <ThemedText style={styles.totalsLabel}>
              {t("orders.subtotal")}
            </ThemedText>
            <ThemedText style={styles.totalsValue}>
              ${subtotal.toFixed(2)}
            </ThemedText>
          </View>
          {/* Fee rows */}
          {feeAmounts.map((fee) => (
            <View key={fee.id} style={styles.totalsRow}>
              <ThemedText style={styles.feeLabel}>{fee.name}</ThemedText>
              <ThemedText style={styles.feeValue}>
                {fee.percentage}% (${fee.amount.toFixed(2)})
              </ThemedText>
            </View>
          ))}
          <View style={styles.totalsRow}>
            <ThemedText style={styles.totalLabel}>
              {t("orders.total")}
            </ThemedText>
            <ThemedText style={styles.totalValue}>
              ${total.toFixed(2)}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Submit Button */}
      {pendingItems.length > 0 && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={async () => {
              try {
                const orderPayload = {
                  items: pendingItems.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                  })),
                };

                await createOrder(orderPayload).unwrap();

                showToast(t("orders.orderCreated"), "success");
                setPendingItems([]); // Clear pending items after submission
              } catch (error: any) {
                showToast(
                  error?.data?.message || t("orders.orderSubmitError"),
                  "error"
                );
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <ThemedText style={styles.submitButtonText}>
                {t("orders.submitWithCount", { count: pendingItems.length })}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {t("orders.addToOrder")}
              </ThemedText>
            </View>

            {inventoryLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <ThemedText style={styles.loadingText}>
                  {t("orders.loadingInventory")}
                </ThemedText>
              </View>
            ) : (
              <ScrollView style={styles.modalBody}>
                {/* Category Selection */}
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>
                    {t("orders.selectCategory")}
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
                    {t("orders.selectItem")}
                  </ThemedText>
                  <ScrollView
                    style={styles.itemScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {categoryItems.map((item) => (
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
                        {t("orders.selectCategoryFirst")}
                      </ThemedText>
                    )}
                    {selectedCategory && categoryItems.length === 0 && (
                      <ThemedText style={styles.disabledText}>
                        {t("orders.allItemsAdded")}
                      </ThemedText>
                    )}
                  </ScrollView>
                </View>

                {/* Quantity Selection */}
                {selectedItem && (
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>
                      {t("orders.selectQuantity")}
                    </ThemedText>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          setOrderQuantity(Math.max(1, orderQuantity - 1))
                        }
                      >
                        <ThemedText style={styles.quantityButtonText}>
                          -
                        </ThemedText>
                      </TouchableOpacity>
                      <View style={styles.quantityDisplay}>
                        <ThemedText style={styles.quantityText}>
                          {orderQuantity}
                        </ThemedText>
                      </View>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                          const maxQuantity = selectedItem.quantity || 0;
                          setOrderQuantity(
                            Math.min(maxQuantity, orderQuantity + 1)
                          );
                        }}
                      >
                        <ThemedText style={styles.quantityButtonText}>
                          +
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                    <ThemedText style={styles.quantityInfo}>
                      {t("orders.available", {
                        quantity: selectedItem.quantity,
                        unit: selectedItem.type_of_unit,
                      })}
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>
                  {t("orders.cancel")}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!selectedCategory || !selectedItem) &&
                    styles.createButtonDisabled,
                ]}
                onPress={() => handleSubmitItem(selectedItem as Item)}
                disabled={!selectedCategory || !selectedItem}
              >
                <ThemedText style={styles.createButtonText}>
                  {t("orders.submitItem")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Clear Confirmation Modal */}
      <Modal
        visible={showClearModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowClearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.clearModalContent}>
            <ThemedText style={styles.clearModalTitle}>
              {t("orders.clearAllItems")}
            </ThemedText>
            <ThemedText style={styles.clearModalMessage}>
              {t("orders.clearAllConfirm", { count: pendingItems.length })}
            </ThemedText>
            <View style={styles.clearModalButtons}>
              <TouchableOpacity
                style={styles.clearCancelButton}
                onPress={() => setShowClearModal(false)}
              >
                <ThemedText style={styles.clearCancelButtonText}>
                  {t("orders.cancel")}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearConfirmButton}
                onPress={handleClearAllItems}
              >
                <ThemedText style={styles.clearConfirmButtonText}>
                  {t("orders.clearAll")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  clearButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterButton: {
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  plusButton: {
    backgroundColor: "#E3F2FD",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  // Orders list styles
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
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
    lineHeight: 24,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 24,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginRight: 8,
    minWidth: 20,
    textAlignVertical: "center",
    lineHeight: 24,
  },
  orderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlignVertical: "center",
    lineHeight: 24,
  },
  orderItemRow: {
    padding: 8,
  },
  orderItemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    marginBottom: 0,
  },
  orderQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderQuantityButton: {
    backgroundColor: "#007AFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  orderQuantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  orderQuantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
    marginBottom: 0,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  // Totals container styles
  totalsContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalsLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  totalsValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  feeLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#999",
    paddingLeft: 12,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: "400",
    color: "#999",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  // Submit button styles
  submitContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    maxHeight: 400,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  categoryScroll: {
    maxHeight: 50,
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
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Clear modal styles
  clearModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "85%",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  clearModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  clearModalMessage: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
  },
  clearModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clearCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    alignItems: "center",
  },
  clearCancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  clearConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: "#FF3B30",
    alignItems: "center",
  },
  clearConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Quantity selector styles
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
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  quantityDisplay: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    minWidth: 60,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  quantityInfo: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
});
