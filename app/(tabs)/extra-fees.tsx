import { FeeCard } from "@/components/FeeCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/contexts/ToastContext";
import { useGetFeesQuery, useUpdateFeeMutation } from "@/redux/fees/apiSlice";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExtraFeesScreen() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: fees = [], isLoading, error } = useGetFeesQuery();
  const [updateFee, { isLoading: isUpdating }] = useUpdateFeeMutation();
  const [feeValues, setFeeValues] = useState<Record<number, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<number, string>>(
    {}
  );

  // Initialize values when fees are loaded
  useEffect(() => {
    if (fees.length > 0) {
      const initialValues: Record<number, string> = {};
      fees.forEach((fee) => {
        initialValues[fee.id] = fee.value?.toString() || "";
      });
      setFeeValues(initialValues);
      setOriginalValues(initialValues);
    }
  }, [fees]);

  const handleFeeChange = (feeId: number, value: string) => {
    setFeeValues((prev) => ({
      ...prev,
      [feeId]: value,
    }));
  };

  // Check if any values have changed
  const hasChanges = useMemo(() => {
    return Object.keys(feeValues).some(
      (feeId) => feeValues[Number(feeId)] !== originalValues[Number(feeId)]
    );
  }, [feeValues, originalValues]);

  const handleSaveChanges = async () => {
    try {
      // Get all fees that have changed
      const changedFees = fees.filter(
        (fee) => feeValues[fee.id] !== originalValues[fee.id]
      );

      // Update each changed fee
      const updatePromises = changedFees.map((fee) => {
        const updatedFee = {
          id: fee.id,
          name: fee.name,
          value: parseFloat(feeValues[fee.id]) || 0,
          applies_to: fee.applies_to,
        };
        return updateFee(updatedFee).unwrap();
      });

      await Promise.all(updatePromises);

      // Update original values to match current values
      setOriginalValues({ ...feeValues });

      showToast(t("extraFees.saveSuccess"), "success");
    } catch (error) {
      console.error("Failed to save fees:", error);
      showToast(t("extraFees.saveError"), "error");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/settings")}
        >
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          {t("extraFees.title")}
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText style={styles.loadingText}>
                {t("extraFees.loadingFees")}
              </ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                {t("extraFees.errorLoadingFees")}
              </ThemedText>
            </View>
          ) : fees.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {t("extraFees.noFeesConfigured")}
              </ThemedText>
            </View>
          ) : (
            fees.map((fee) => (
              <FeeCard
                key={fee.id}
                label={fee.name}
                placeholder={t("extraFees.enterFeePlaceholder", {
                  feeName: fee.name.toLowerCase(),
                })}
                value={feeValues[fee.id] || ""}
                onChangeText={(value) => handleFeeChange(fee.id, value)}
              />
            ))
          )}
        </ScrollView>

        {/* Save Changes Button */}
        {fees.length > 0 && (
          <View style={styles.saveContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!hasChanges || isUpdating) && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveChanges}
              disabled={!hasChanges || isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText style={styles.saveButtonText}>
                  {t("extraFees.saveChanges")}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
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
  },
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  saveContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: "#A0A0A0",
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
