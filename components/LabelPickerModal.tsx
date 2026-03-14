import { useGetLabelsQuery } from "@/redux/labels/apiSlice";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";

type LabelPickerModalProps = {
  visible: boolean;
  selectedLabels: string[];
  onConfirm: (labels: string[]) => void;
  onClose: () => void;
  allowCustom?: boolean;
};

export function LabelPickerModal({
  visible,
  selectedLabels,
  onConfirm,
  onClose,
  allowCustom = true,
}: LabelPickerModalProps) {
  const { t } = useTranslation();
  const { data: labelsData = [] } = useGetLabelsQuery();
  const insets = useSafeAreaInsets();

  const [inputText, setInputText] = useState("");
  const [customLabels, setCustomLabels] = useState<string[]>([]);
  const [selectedApiLabels, setSelectedApiLabels] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      const apiLabelNames = labelsData.map((l) => l.name);
      const custom = selectedLabels.filter((l) => !apiLabelNames.includes(l));
      const apiSelected = selectedLabels.filter((l) => apiLabelNames.includes(l));
      setCustomLabels(custom);
      setSelectedApiLabels(apiSelected);
      setInputText("");
    }
  }, [visible]);

  const handleAddCustomLabel = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (!customLabels.includes(trimmed)) {
      setCustomLabels((prev) => [trimmed, ...prev]);
    }
    setInputText("");
  };

  const handleDeleteCustomLabel = (label: string) => {
    setCustomLabels((prev) => prev.filter((l) => l !== label));
  };

  const handleToggleApiLabel = (label: string) => {
    setSelectedApiLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleConfirm = () => {
    onConfirm([...customLabels, ...selectedApiLabels]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <ThemedText style={styles.cancelText}>
                {t("orders.cancel")}
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.title}>
              {t("orders.selectLabels")}
            </ThemedText>
            <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
              <ThemedText style={styles.doneText}>{t("orders.done")}</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Custom label input */}
          {allowCustom && (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder={t("orders.typeCustomLabel")}
                placeholderTextColor="#999"
                returnKeyType="done"
                onSubmitEditing={handleAddCustomLabel}
                autoCapitalize="sentences"
              />
              <TouchableOpacity
                style={[styles.addBtn, !inputText.trim() && styles.addBtnDisabled]}
                onPress={handleAddCustomLabel}
                disabled={!inputText.trim()}
              >
                <IconSymbol name="plus" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Label list */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Custom labels at top — press to delete */}
            {allowCustom && customLabels.map((label) => (
              <TouchableOpacity
                key={`custom-${label}`}
                style={[styles.labelItem, styles.labelItemSelected]}
                onPress={() => handleDeleteCustomLabel(label)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.labelTextSelected}>{label}</ThemedText>
                <IconSymbol name="xmark" size={14} color="white" />
              </TouchableOpacity>
            ))}

            {/* API labels — press to toggle */}
            {labelsData.map((label) => {
              const isSelected = selectedApiLabels.includes(label.name);
              return (
                <TouchableOpacity
                  key={label.id}
                  style={[styles.labelItem, isSelected && styles.labelItemSelected]}
                  onPress={() => handleToggleApiLabel(label.name)}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[
                      styles.labelText,
                      isSelected && styles.labelTextSelected,
                    ]}
                  >
                    {label.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}

            {labelsData.length === 0 && customLabels.length === 0 && (
              <ThemedText style={styles.emptyText}>
                {t("orders.noLabelsAvailable")}
              </ThemedText>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    backgroundColor: "white",
  },
  headerButton: {
    minWidth: 60,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
  },
  doneText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  input: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    height: 46,
  },
  addBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    backgroundColor: "#C7C7CC",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  labelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  labelItemSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  labelText: {
    fontSize: 16,
    color: "#333",
  },
  labelTextSelected: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    marginTop: 32,
  },
});
