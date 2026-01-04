import { ThemedText } from "@/components/themed-text";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type FeeCardProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
};

export function FeeCard({
  label,
  placeholder,
  value,
  onChangeText,
  editable = true,
}: FeeCardProps) {
  const handleChange = (text: string) => {
    // Only allow numbers and decimal point
    const numericValue = text.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return;
    }
    onChangeText(numericValue);
  };

  return (
    <View style={styles.inputSection}>
      <ThemedText style={styles.inputLabel}>{label}</ThemedText>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    color: "#000",
  },
  inputDisabled: {
    backgroundColor: "#F5F5F5",
    color: "#999",
  },
});
