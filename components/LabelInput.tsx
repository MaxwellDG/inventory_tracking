import { useGetLabelsQuery } from "@/redux/labels/apiSlice";
import { Picker } from "@react-native-picker/picker";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

type LabelInputProps = {
  labelId: number | null;
  labelName: string;
  onLabelChange: (id: number | null, name: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: any;
};

export function LabelInput({
  labelId,
  labelName,
  onLabelChange,
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
      <TextInput
        style={[styles.labelTextInput, style]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={labelName}
        onChangeText={handleTextChange}
        autoCapitalize={autoCapitalize}
      />
      <View style={styles.pickerWrapper}>
        <Picker
          ref={pickerRef}
          selectedValue={labelId?.toString() || ""}
          onValueChange={handlePickerChange}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label={t("orders.selectLabel")} value="" />
          {labelsData.map((label) => (
            <Picker.Item
              key={label.id}
              label={label.name}
              value={label.id.toString()}
            />
          ))}
        </Picker>
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
  labelTextInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    height: 50,
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
  picker: {
    width: 50,
    height: 50,
    color: "transparent",
  },
  pickerButton: {
    position: "absolute",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
