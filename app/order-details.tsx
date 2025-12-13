import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  useDeleteOrderMutation,
  useGetOrderQuery,
  useUpdateOrderMutation,
} from "@/redux/orders/apiSlice";
import { ORDER_STATUS, OrderListItem } from "@/redux/orders/types";
import { useUpdateItemQuantityMutation } from "@/redux/products/apiSlice";
import { Picker } from "@react-native-picker/picker";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrderDetailsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();

  // Parse the order data passed from history screen
  const orderData: OrderListItem = JSON.parse(params.order as string);

  // Fetch full order details including items
  const {
    data: fullOrder,
    isLoading,
    error,
  } = useGetOrderQuery(orderData.uuid);

  console.log("Full order: ", fullOrder);

  const [receiptId, setReceiptId] = useState("");
  const [initialReceiptId, setInitialReceiptId] = useState("");
  const [isDelivered, setIsDelivered] = useState(false);
  const [manualStatus, setManualStatus] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restoreInventory, setRestoreInventory] = useState(false);

  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [updateItemQuantity] = useUpdateItemQuantityMutation();

  // Set initial receipt ID and delivery status when order loads
  useEffect(() => {
    if (fullOrder) {
      const initialReceipt = fullOrder.receipt_id || "";
      setReceiptId(initialReceipt);
      setInitialReceiptId(initialReceipt);

      // Set isDelivered based on current status
      setIsDelivered(fullOrder.status === "pending");

      // Set manual status to current order status
      setManualStatus(fullOrder.status);
    }
  }, [fullOrder]);

  const handleCopyUuid = async () => {
    await Clipboard.setStringAsync(orderData.uuid);
  };

  const handleSaveReceiptId = async () => {
    try {
      await updateOrder({
        order_uuid: orderData.uuid,
        receipt_id: receiptId,
      }).unwrap();
      setInitialReceiptId(receiptId);
    } catch (error) {
      console.error("Failed to update receipt ID:", error);
    }
  };

  const handleDeliveryToggle = async (value: boolean) => {
    setIsDelivered(value);
    try {
      await updateOrder({
        order_uuid: orderData.uuid,
        status: value ? "pending" : "open",
      }).unwrap();
    } catch (error) {
      console.error("Failed to update delivery status:", error);
      // Revert the switch if update fails
      setIsDelivered(!value);
    }
  };

  const handleManualStatusChange = async (value: string) => {
    if (value === "delete") {
      setShowDeleteModal(true);
      // Reset to current status since we're not deleting yet
      if (fullOrder) {
        setManualStatus(fullOrder.status);
      }
    } else {
      setManualStatus(value);
      try {
        await updateOrder({
          order_uuid: orderData.uuid,
          status: value as keyof typeof ORDER_STATUS,
        }).unwrap();
      } catch (error) {
        console.error("Failed to update order status:", error);
        // Revert if update fails
        if (fullOrder) {
          setManualStatus(fullOrder.status);
        }
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      // First restore inventory if checkbox is checked
      if (restoreInventory && fullOrder?.items) {
        // Update each item's quantity by adding back the order quantity
        for (const orderItem of fullOrder.items) {
          try {
            await updateItemQuantity({
              id: orderItem.id,
              quantity: orderItem.quantity,
            }).unwrap();
          } catch (error) {
            console.error(
              `Failed to restore inventory for item ${orderItem.id}:`,
              error
            );
          }
        }
      }

      // Then delete the order
      await deleteOrder(orderData.uuid).unwrap();
      setShowDeleteModal(false);
      router.back();
    } catch (error) {
      console.error("Failed to delete order:", error);
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setRestoreInventory(false);
  };

  const isReceiptIdChanged = receiptId !== initialReceiptId;
  const showDeliveryCard = fullOrder?.receipt_id === null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Is Delivered Card - Only show when receipt_id is null */}
        {showDeliveryCard && (
          <View style={styles.deliveryCard}>
            <ThemedText style={styles.deliveryLabel}>
              {t("history.isDelivered")}
            </ThemedText>
            <Switch
              value={isDelivered}
              onValueChange={handleDeliveryToggle}
              trackColor={{ false: "#E5E5E5", true: "#34C759" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5E5"
            />
          </View>
        )}

        {/* Receipt ID Section */}
        <View style={styles.receiptSection}>
          <ThemedText style={styles.receiptLabel}>
            {t("history.receiptId")}
          </ThemedText>
          <TextInput
            style={styles.receiptInput}
            value={receiptId}
            onChangeText={setReceiptId}
            placeholder={t("history.enterReceiptId")}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!isReceiptIdChanged || isUpdating) && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveReceiptId}
            disabled={!isReceiptIdChanged || isUpdating}
          >
            <ThemedText style={styles.saveButtonText}>
              {t("history.save")}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <TouchableOpacity
            style={[
              styles.summaryRow,
              { flexDirection: "column", alignItems: "flex-start" },
            ]}
            onPress={handleCopyUuid}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <ThemedText style={styles.summaryLabel}>
                {t("history.orderId")}:
              </ThemedText>
              <IconSymbol name="doc.on.doc" size={20} color="#007AFF" />
            </View>
            <ThemedText style={[styles.summaryValue, styles.orderIdValue]}>
              {orderData.uuid}
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>
              {t("history.subtotal")}:
            </ThemedText>
            <ThemedText style={styles.summaryValue}>
              ${orderData.subtotal}
            </ThemedText>
          </View>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>
              {t("history.total")}:
            </ThemedText>
            <ThemedText style={[styles.summaryValue, styles.totalValue]}>
              ${orderData.total}
            </ThemedText>
          </View>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>
              {t("history.status")}:
            </ThemedText>
            <ThemedText
              style={[
                styles.summaryValue,
                styles.statusText,
                orderData.status === "completed" && styles.statusCompleted,
                orderData.status === "pending" && styles.statusPending,
                orderData.status === "open" && styles.statusOpen,
              ]}
            >
              {t(`history.${orderData.status.toLowerCase()}`)}
            </ThemedText>
          </View>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>
              {t("history.createdBy")}:
            </ThemedText>
            <ThemedText style={styles.summaryValue}>
              {orderData.user.name}
            </ThemedText>
          </View>

          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>
              {t("history.createdAt")}:
            </ThemedText>
            <ThemedText style={styles.summaryValue}>
              {new Date(orderData.created_at).toLocaleDateString()} at{" "}
              {new Date(orderData.created_at).toLocaleTimeString()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.itemsSection}>
          <ThemedText style={styles.itemsTitle}>
            {t("history.items")}
          </ThemedText>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText style={styles.loadingText}>
                {t("history.loadingItems")}
              </ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                {t("history.errorLoadingItems")}
              </ThemedText>
            </View>
          ) : fullOrder?.items && fullOrder.items.length > 0 ? (
            fullOrder.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  {item.price && (
                    <ThemedText style={styles.itemPrice}>
                      ${item.price}
                    </ThemedText>
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <ThemedText style={styles.itemQuantity}>
                    {t("history.quantity")}: {item.quantity} {item.type_of_unit}
                  </ThemedText>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {t("history.noItems")}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Manual Status Change Section */}
        <View style={styles.manualStatusCard}>
          <ThemedText style={styles.manualStatusLabel}>
            {t("history.manualStatusChange")}
          </ThemedText>
          <Picker
            selectedValue={manualStatus}
            onValueChange={handleManualStatusChange}
            style={styles.statusPicker}
          >
            <Picker.Item label={t("history.open")} value="open" />
            <Picker.Item label={t("history.pendingPayment")} value="pending" />
            <Picker.Item label={t("history.completed")} value="completed" />
            <Picker.Item
              label={t("history.delete")}
              value="delete"
              color="#FF3B30"
            />
          </Picker>
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelDelete}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>
                {t("history.deleteOrder")}
              </ThemedText>
              <ThemedText style={styles.modalMessage}>
                {t("history.deleteOrderConfirm")}
              </ThemedText>

              <View style={styles.checkboxContainer}>
                <Switch
                  value={restoreInventory}
                  onValueChange={setRestoreInventory}
                  trackColor={{ false: "#E5E5E5", true: "#34C759" }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E5E5E5"
                />
                <ThemedText style={styles.checkboxLabel}>
                  {t("history.restoreInventory")}
                </ThemedText>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancelDelete}
                  disabled={isDeleting}
                >
                  <ThemedText style={styles.cancelButtonText}>
                    {t("history.cancel")}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.deleteButtonText}>
                      {t("history.delete")}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  orderIdValue: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusText: {
    textTransform: "capitalize",
  },
  statusCompleted: {
    color: "#34C759",
  },
  statusPending: {
    color: "#FF9500",
  },
  statusOpen: {
    color: "#007AFF",
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemCategory: {
    fontSize: 14,
    color: "#999",
  },
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  receiptSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  receiptLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  receiptInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  manualStatusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  manualStatusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    marginBottom: 12,
  },
  statusPicker: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E5E5",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
