import { LabelPickerModal } from "@/components/LabelPickerModal";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type LabelPickerFieldProps = {
  label: string;
  required?: boolean;
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
  allowCustom?: boolean;
};

export function LabelPickerField({
  label,
  required,
  selectedLabels,
  onLabelsChange,
  allowCustom,
}: LabelPickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <View style={styles.headerRow}>
        <ThemedText style={styles.fieldLabel}>
          {label}
          {required && <ThemedText style={styles.requiredStar}> *</ThemedText>}
        </ThemedText>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowPicker(true)}
        >
          <IconSymbol name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {selectedLabels.length > 0 && (
        <View style={styles.chipsRow}>
          {selectedLabels.map((lbl, i) => (
            <View key={i} style={styles.chip}>
              <ThemedText style={styles.chipText}>{lbl}</ThemedText>
            </View>
          ))}
        </View>
      )}

      <LabelPickerModal
        visible={showPicker}
        selectedLabels={selectedLabels}
        onConfirm={(labels) => {
          onLabelsChange(labels);
          setShowPicker(false);
        }}
        onClose={() => setShowPicker(false)}
        allowCustom={allowCustom}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  requiredStar: {
    color: "#FF3B30",
  },
  pickerButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  chip: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
});
