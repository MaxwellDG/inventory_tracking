import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

interface LanguagePickerProps {
  variant?: "default" | "compact";
}

export function LanguagePicker({ variant = "default" }: LanguagePickerProps) {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
  };

  const isCompact = variant === "compact";

  return (
    <View
      style={[
        styles.pickerContainer,
        isCompact && styles.pickerContainerCompact,
      ]}
    >
      <Picker
        selectedValue={selectedLanguage}
        onValueChange={handleLanguageChange}
        style={[styles.picker, isCompact && styles.pickerCompact]}
      >
        <Picker.Item label="🇺🇸 English" value="en" />
        <Picker.Item label="🇪🇸 Español" value="es" />
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerContainerCompact: {
    width: 80,
    height: 40,
    borderRadius: 8,
    borderColor: "#E1E5E9",
    backgroundColor: "#F8F9FA",
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  picker: {
    height: 60,
  },
  pickerCompact: {
    height: 40,
    width: 80,
  },
});
