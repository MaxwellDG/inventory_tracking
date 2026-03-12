import { LabelPickerField } from "@/components/LabelPickerField";
import { Paginator } from "@/components/Paginator";
import { ThemedPicker } from "@/components/ThemedPicker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useGetOrdersQuery } from "@/redux/orders/apiSlice";
import { ORDER_STATUS } from "@/redux/orders/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(() => getYesterday());
  const [endDate, setEndDate] = useState<Date | null>(() => getToday());
  const [labelFilter, setLabelFilter] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] =
    useState<keyof typeof ORDER_STATUS>("open");
  const [pageNumber, setPageNumber] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Draft state — edited inside the modal, committed on close
  const [draftStartDate, setDraftStartDate] = useState<Date | null>(() => getYesterday());
  const [draftEndDate, setDraftEndDate] = useState<Date | null>(() => getToday());
  const [draftLabelFilter, setDraftLabelFilter] = useState<string[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch,
  } = useGetOrdersQuery(
    {
      page: pageNumber,
      startDate: startDate?.toISOString().split("T")[0],
      endDate: endDate?.toISOString().split("T")[0],
      status: selectedStatus,
      label: labelFilter.length > 0 ? labelFilter.join(",") : undefined,
    },
    { pollingInterval: 10000 }
  );

  const orders = ordersResponse?.data || [];
  const pagination = ordersResponse?.pagination;

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handlePreviousPage = () => {
    if (pagination?.hasPrevious) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handleOrderPress = (order: (typeof orders)[0]) => {
    router.push({
      pathname: "/order-details",
      params: {
        order: JSON.stringify(order),
      },
    });
  };

  const openFilters = () => {
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setDraftLabelFilter(labelFilter);
    setShowFilters(true);
  };

  const closeFilters = () => {
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setLabelFilter(draftLabelFilter);
    setShowFilters(false);
  };

  const handleStartDatePress = () => {
    setShowStartDatePicker(true);
  };

  const handleEndDatePress = () => {
    setShowEndDatePicker(true);
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const dateWithTime = new Date(selectedDate);
      dateWithTime.setHours(0, 0, 0, 0);

      if (draftEndDate && dateWithTime > draftEndDate) {
        return;
      }

      setDraftStartDate(dateWithTime);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const dateWithTime = new Date(selectedDate);
      dateWithTime.setHours(23, 59, 59, 999);

      if (draftStartDate && dateWithTime < draftStartDate) {
        return;
      }

      setDraftEndDate(dateWithTime);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>
              {t("history.title")}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.filtersButton}
            onPress={openFilters}
          >
            <ThemedText style={styles.filtersButtonText}>Filters</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.statusFilterContainer}>
          <ThemedPicker
            selectedValue={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value)}
            style={styles.statusPicker}
          >
            <ThemedPicker.Item
              label={t("history.completed")}
              value="completed"
              color="#000"
            />
            <ThemedPicker.Item
              label={t("history.pendingPayment")}
              value="pending"
              color="#000"
            />
            <ThemedPicker.Item
              label={t("history.open")}
              value="open"
              color="#000"
            />
          </ThemedPicker>
        </View>
      </View>

      <ScrollView
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {t("history.loadingOrders")}
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {t("history.errorLoadingOrders")}
            </ThemedText>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {t("history.noOrdersFound")}
            </ThemedText>
          </View>
        ) : (
          orders.map((order) => {
            console.log("order labels: ", order.labels);
            return (
            <TouchableOpacity
              key={order.uuid}
              style={styles.orderCard}
              onPress={() => handleOrderPress(order)}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderLabelChips}>
                  {order.labels.map((lbl) => (
                    <View key={lbl.id} style={styles.orderLabelChip}>
                      <ThemedText style={styles.orderLabelChipText}>{lbl.name}</ThemedText>
                    </View>
                  ))}
                </View>
                <IconSymbol name="chevron.right" size={16} color="#666" />
              </View>
              <View style={styles.orderDetails}>
                <ThemedText style={styles.orderUserName}>
                  {order.user.name}
                </ThemedText>
                <ThemedText style={styles.orderTotal}>
                  ${order.total}
                </ThemedText>
              </View>
            </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {orders.length > 0 && pagination && (
        <Paginator
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeFilters}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Filters</ThemedText>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeFilters}
            >
              <IconSymbol name="xmark" size={18} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Date Range</ThemedText>
              <View style={styles.dateFilterRow}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={handleStartDatePress}
                >
                  <IconSymbol name="calendar" size={16} color="#007AFF" />
                  <ThemedText style={styles.dateButtonText}>
                    {formatDate(draftStartDate)}
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.dash}>—</ThemedText>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={handleEndDatePress}
                >
                  <IconSymbol name="calendar" size={16} color="#007AFF" />
                  <ThemedText style={styles.dateButtonText}>
                    {formatDate(draftEndDate)}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <LabelPickerField
                label="Label"
                selectedLabels={draftLabelFilter}
                onLabelsChange={setDraftLabelFilter}
              />
            </View>
          </View>
        </View>

        {showStartDatePicker && (
          <DateTimePicker
            value={draftStartDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onStartDateChange}
            maximumDate={
              draftEndDate
                ? new Date(Math.min(draftEndDate.getTime(), new Date().getTime()))
                : new Date()
            }
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={draftEndDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onEndDateChange}
            minimumDate={draftStartDate || undefined}
            maximumDate={new Date()}
          />
        )}
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
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  filtersButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filtersButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
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
    lineHeight: 22,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderLabelChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  orderLabelChip: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orderLabelChipText: {
    fontSize: 13,
    color: "white",
    fontWeight: "500",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderUserName: {
    fontSize: 14,
    color: "#666",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    paddingHorizontal: 20,
    gap: 24,
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  statusFilterContainer: {
    marginTop: 12,
  },
  statusPicker: {
    height: 60,
  },
  dateFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    paddingHorizontal: 14,
    height: 50,
  },
  dateButtonText: {
    fontSize: 15,
    color: "#333",
  },
  dash: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
});
