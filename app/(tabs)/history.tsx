import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useGetOrdersQuery } from "@/redux/orders/apiSlice";
import { ORDER_STATUS } from "@/redux/orders/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function HistoryScreen() {
  const { t } = useTranslation();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<keyof typeof ORDER_STATUS>("OPEN");
  const [pageNumber, setPageNumber] = useState(1);

  const {
    data: orders = [],
    isLoading,
    error,
  } = useGetOrdersQuery({
    page: pageNumber,
  });

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleStartDatePress = () => {
    setShowStartDatePicker(true);
  };

  const handleEndDatePress = () => {
    setShowEndDatePicker(true);
  };

  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setEndDate(selectedDate);
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
            {(startDate || endDate) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearDates}
              >
                <ThemedText style={styles.clearButtonText}>
                  {t("history.clear")}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.filterRow}>
          <View style={styles.statusFilterContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value)}
              style={styles.statusPicker}
            >
              <Picker.Item
                label={t("history.completed")}
                value="COMPLETED"
              />
              <Picker.Item
                label={t("history.pendingPayment")}
                value="PENDING_PAYMENT"
              />
              <Picker.Item label={t("history.open")} value="OPEN" />
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
          orders.map((order, index) => {
            const isExpanded = expandedOrders.has(order.uuid);
            return (
              <TouchableOpacity
                key={order.uuid}
                style={styles.orderCard}
                onPress={() => toggleExpanded(order.uuid)}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <ThemedText style={styles.orderId}>{order.uuid}</ThemedText>
                    <IconSymbol
                      name={isExpanded ? "chevron.up" : "chevron.down"}
                      size={16}
                      color="#666"
                    />
                  </View>
                </View>
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {order.items && Array.isArray(order.items) ? (
                      order.items.map((item) => (
                        <ThemedText key={item.id} style={styles.orderText}>
                          {item.name} ({item.quantity} {item.typeOfUnit})
                        </ThemedText>
                      ))
                    ) : (
                      <ThemedText style={styles.orderText}>
                        {t("history.noItemsAvailable")}
                      </ThemedText>
                    )}
                    <ThemedText style={styles.orderUser}>
                      {t("history.createdBy", { name: order.owner.name })}
                    </ThemedText>
                    <ThemedText style={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString()} at{" "}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onEndDateChange}
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
  clearButton: {
    paddingHorizontal: 8,
  },
  clearButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
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
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginRight: 8,
    flex: 1,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  orderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  categoryText: {
    color: "#999",
  },
  orderUser: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666",
    marginTop: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
});
