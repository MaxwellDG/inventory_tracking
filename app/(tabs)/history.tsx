import { Paginator } from "@/components/Paginator";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useGetOrdersQuery } from "@/redux/orders/apiSlice";
import { ORDER_STATUS } from "@/redux/orders/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// Set startDate to yesterday at 00:00:00
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(0, 0, 0, 0);

// Set endDate to today at 23:59:59
const today = new Date();
today.setHours(23, 59, 59, 999);

export default function HistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(yesterday);
  const [endDate, setEndDate] = useState<Date | null>(today);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<keyof typeof ORDER_STATUS>("open");
  const [pageNumber, setPageNumber] = useState(1);

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

      // Only update if the selected date is not after the end date
      if (endDate && dateWithTime > endDate) {
        // Don't update if start date is after end date
        return;
      }

      setStartDate(dateWithTime);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const dateWithTime = new Date(selectedDate);
      dateWithTime.setHours(23, 59, 59, 999);

      // Only update if the selected date is not before the start date
      if (startDate && dateWithTime < startDate) {
        // Don't update if end date is before start date
        return;
      }

      setEndDate(dateWithTime);
    }
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
        </View>
        <View style={styles.filterRow}>
          <View style={styles.statusFilterContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value)}
              style={styles.statusPicker}
            >
              <Picker.Item label={t("history.completed")} value="completed" color="#000" />
              <Picker.Item
                label={t("history.pendingPayment")}
                value="pending"
                color="#000"
              />
              <Picker.Item label={t("history.open")} value="open" color="#000" />
            </Picker>
          </View>
          <View style={styles.dateFilterContainer}>
            <TouchableOpacity
              style={styles.dateFilterButton}
              onPress={handleStartDatePress}
            >
              <IconSymbol name="calendar" size={20} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.dash}>—</ThemedText>
            <TouchableOpacity
              style={styles.dateFilterButton}
              onPress={handleEndDatePress}
            >
              <IconSymbol name="calendar" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
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
              {orders.length === 0
                ? t("history.noOrdersFound")
                : t("history.noOrdersForDateRange")}
            </ThemedText>
          </View>
        ) : (
          orders.map((order, index) => (
            <TouchableOpacity
              key={order.uuid}
              style={styles.orderCard}
              onPress={() => handleOrderPress(order)}
            >
              <View style={styles.orderHeader}>
                <ThemedText style={styles.orderId}>
                  {order.uuid.slice(0, 8)}
                </ThemedText>
                <View style={styles.orderHeaderRight}>
                  <ThemedText style={styles.orderTotal}>
                    ${order.total}
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={16} color="#666" />
                </View>
              </View>
            </TouchableOpacity>
          ))
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

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onStartDateChange}
          maximumDate={
            endDate
              ? new Date(Math.min(endDate.getTime(), new Date().getTime()))
              : new Date()
          }
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onEndDateChange}
          minimumDate={startDate || undefined}
          maximumDate={new Date()}
        />
      )}
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
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
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
  statusFilterContainer: {
    flex: 1,
    marginRight: 16,
    padding: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingVertical: 0,
  },
  statusPicker: {
    height: 60,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dateFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateFilterButton: {
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
  dash: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
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
  },
  orderHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
});
