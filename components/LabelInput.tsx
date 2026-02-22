import { useGetLabelsQuery } from "@/redux/labels/apiSlice";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedPicker } from "./ThemedPicker";
import { IconSymbol } from "./ui/icon-symbol";

type LabelInputProps = {
  labelId: number | null;
  labelName: string;
  onLabelChange: (id: number | null, name: string) => void;
  onClear?: () => void;
  placeholder?: string;
  placeholderTextColor?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: any;
};

export function LabelInput({
  labelId,
  labelName,
  onLabelChange,
  onClear,
  placeholder,
  placeholderTextColor,
  autoCapitalize,
  style,
}: LabelInputProps) {
  const { t } = useTranslation();
  const { data: labelsData = [] } = useGetLabelsQuery();
  const pickerRef = useRef<any>(null);

  const handlePickerPress = () => {
    if (Platform.OS === "android" && pickerRef.current) {
      // On Android, programmatically focus the picker
      pickerRef.current.focus();
    }
  };

  const handleTextChange = (text: string) => {
    // When user types, clear the label ID (custom label)
    onLabelChange(null, text);
  };

  const handlePickerChange = (itemValue: string) => {
    if (itemValue !== "") {
      const selectedLabel = labelsData.find((l) => l.id.toString() === itemValue);
      if (selectedLabel) {
        onLabelChange(selectedLabel.id, selectedLabel.name);
      }
    }
  };

  return (
    <View style={styles.labelInputContainer}>
      <View style={styles.textInputWrapper}>
        <TextInput
          style={[styles.labelTextInput, onClear && labelName.length > 0 && styles.labelTextInputWithClear, style]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={labelName}
          onChangeText={handleTextChange}
          autoCapitalize={autoCapitalize}
        />
        {onClear && labelName.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={onClear}>
            <IconSymbol name="xmark" size={16} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.pickerWrapper}>
        <ThemedPicker
          ref={pickerRef}
          selectedValue={labelId?.toString() || ""}
          onValueChange={handlePickerChange}
          style={styles.picker}
          containerStyle={styles.pickerContainer}
        >
          <ThemedPicker.Item label={t("orders.selectLabel")} value="" color="#000" />
          {labelsData.map((label) => (
            <ThemedPicker.Item
              key={label.id}
              label={label.name}
              value={label.id.toString()}
              color="#000"
            />
          ))}
        </ThemedPicker>
        {Platform.OS === "android" && (
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={handlePickerPress}
            activeOpacity={0.7}
          >
            <IconSymbol name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInputWrapper: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
  },
  labelTextInput: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    height: 50,
  },
  labelTextInputWithClear: {
    paddingRight: 40,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  pickerWrapper: {
    width: 50,
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pickerContainer: {
    backgroundColor: "transparent",
    borderRadius: 0,
  },
  picker: {
    width: 50,
    height: 50,
    color: "transparent",
    backgroundColor: "transparent",
  },
  pickerButton: {
    position: "absolute",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
