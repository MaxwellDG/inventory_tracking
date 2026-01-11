import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Tooltip } from "@/components/ui/Tooltip";
import { useToast } from "@/contexts/ToastContext";
import { Fee } from "@/redux/fees/types";
import {
  useDeleteOrderMutation,
  useGetOrderQuery,
  useUpdateOrderMutation,
} from "@/redux/orders/apiSlice";
import { OrderListItem } from "@/redux/orders/types";
import { useUpdateItemQuantityMutation } from "@/redux/products/apiSlice";
import { RootState } from "@/redux/store";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

export default function OrderDetailsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "admin";

  // Parse the order data passed from history screen
  const orderData: OrderListItem = JSON.parse(params.order as string);

  // Fetch full order details including items
  const {
    data: fullOrder,
    isLoading,
    error,
  } = useGetOrderQuery(orderData.uuid);

  const [receiptId, setReceiptId] = useState("");
  const [initialReceiptId, setInitialReceiptId] = useState("");
  const [isDelivered, setIsDelivered] = useState(
    orderData.status === "pending" || orderData.status === "completed"
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restoreInventory, setRestoreInventory] = useState(false);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

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
      setIsDelivered(
        fullOrder.status === "pending" || fullOrder.status === "completed"
      );
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
    if (isDeliveryDisabled) {
      showToast(t("history.cannotToggleCompleted"), "error");
      return;
    }

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

  const handleDeliveryCardPress = () => {
    if (isDeliveryDisabled) {
      showToast(t("history.cannotToggleCompleted"), "error");
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

  const handleDeleteItemPress = (item: any) => {
    setItemToDelete(item);
    setShowDeleteItemModal(true);
  };

  const handleCancelDeleteItem = () => {
    setShowDeleteItemModal(false);
    setItemToDelete(null);
  };

  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete || !fullOrder) return;

    try {
      // Filter out the item to delete from the order's items
      const updatedItems = fullOrder.items.filter(
        (item) => item.id !== itemToDelete.id
      );

      // Update the order with the new items list
      await updateOrder({
        order_uuid: orderData.uuid,
        items: updatedItems,
      }).unwrap();

      showToast(t("history.itemDeleted"), "success");
      setShowDeleteItemModal(false);
      setItemToDelete(null);
    } catch (error: any) {
      showToast(error?.data?.message || t("history.itemDeleteError"), "error");
      setShowDeleteItemModal(false);
      setItemToDelete(null);
    }
  };

  const isReceiptIdChanged = receiptId !== initialReceiptId;

  const isDeliveryDisabled = useMemo(
    () => fullOrder?.status === "completed" || !!fullOrder?.receipt_id,
    [fullOrder]
  );

  // Check if user can delete this order (admin or order creator)
  const canDeleteOrder = useMemo(
    () => isAdmin || orderData.user.id === user?.id,
    [isAdmin, orderData.user.id, user?.id]
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Is Delivered Card - Only show when receipt_id is null */}
          <TouchableOpacity
            style={styles.deliveryCard}
            activeOpacity={isDeliveryDisabled ? 0.7 : 1}
            onPress={handleDeliveryCardPress}
          >
            <View style={styles.deliveryLabelContainer}>
              <ThemedText style={styles.deliveryLabel}>
                {t("history.isDelivered")}
              </ThemedText>
              <Tooltip
                content={t("history.isDeliveredTooltip")}
                iconSize={16}
                iconColor="#999"
              />
            </View>
            <Switch
              value={isDelivered}
              onValueChange={handleDeliveryToggle}
              trackColor={{ false: "#E5E5E5", true: "#34C759" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5E5"
              disabled={isDeliveryDisabled}
            />
          </TouchableOpacity>

          {/* Receipt ID Section */}
          <View style={styles.receiptSection}>
            <View style={styles.receiptLabelContainer}>
              <ThemedText style={styles.receiptLabel}>
                {t("history.receiptId")}
              </ThemedText>
              <Tooltip
                content={t("history.receiptIdTooltip")}
                iconSize={16}
                iconColor="#999"
              />
            </View>
            <TextInput
              style={[
                styles.receiptInput,
                !isAdmin && styles.receiptInputDisabled,
              ]}
              value={receiptId}
              onChangeText={setReceiptId}
              placeholder={t("history.enterReceiptId")}
              placeholderTextColor="#999"
              editable={isAdmin}
            />
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isReceiptIdChanged || isUpdating) &&
                  styles.saveButtonDisabled,
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
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

            {/* Fee rows */}
            {fullOrder?.fees &&
              fullOrder.fees.length > 0 &&
              fullOrder.fees.map((fee: Fee) => {
                return (
                  <View key={fee.id} style={styles.summaryRow}>
                    <ThemedText style={styles.feeLabel}>{fee.name}</ThemedText>
                    <ThemedText style={styles.feeValue}>
                      ${fee.value}
                    </ThemedText>
                  </View>
                );
              })}

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
                  fullOrder?.status === "completed" && styles.statusCompleted,
                  fullOrder?.status === "pending" && styles.statusPending,
                  fullOrder?.status === "open" && styles.statusOpen,
                ]}
              >
                {fullOrder?.status
                  ? t(`history.${fullOrder.status.toLowerCase()}`)
                  : t(`history.${orderData.status.toLowerCase()}`)}
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
                    <View style={styles.itemHeaderRight}>
                      {item.price && (
                        <ThemedText style={styles.itemPrice}>
                          ${item.price}
                        </ThemedText>
                      )}
                      <TouchableOpacity
                        style={styles.deleteItemButton}
                        onPress={() => handleDeleteItemPress(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <IconSymbol name="trash" size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.itemDetails}>
                    <ThemedText style={styles.itemQuantity}>
                      {t("history.quantity")}: {item.quantity}{" "}
                      {item.type_of_unit}
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

          {/* Delete Button - Only show if user is admin or order creator */}
          {canDeleteOrder && (
            <TouchableOpacity
              style={styles.deleteSection}
              onPress={() => setShowDeleteModal(true)}
            >
              <ThemedText style={styles.deleteText}>
                {t("history.delete")}
              </ThemedText>
            </TouchableOpacity>
          )}

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

          {/* Delete Item Confirmation Modal */}
          <Modal
            visible={showDeleteItemModal}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCancelDeleteItem}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>
                  {t("history.deleteItem")}
                </ThemedText>
                <ThemedText style={styles.modalMessage}>
                  {t("history.deleteItemConfirm", {
                    itemName: itemToDelete?.name || "",
                  })}
                </ThemedText>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelDeleteItem}
                  >
                    <ThemedText style={styles.cancelButtonText}>
                      {t("history.cancel")}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleConfirmDeleteItem}
                  >
                    <ThemedText style={styles.deleteButtonText}>
                      {t("history.delete")}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
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
  itemHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  deleteItemButton: {
    padding: 4,
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
    paddingHorizontal: 20,
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
  deliveryLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  receiptLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
  receiptInputDisabled: {
    backgroundColor: "#F5F5F5",
    color: "#999",
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
  deleteSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
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
