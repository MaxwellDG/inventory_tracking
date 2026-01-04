import { save, STORAGE_KEYS } from "@/redux/auth/secureStorage";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

interface LanguagePickerProps {
  variant?: "default" | "compact";
  onChange?: (locale: string) => void;
}

export function LanguagePicker({ variant = "default", onChange }: LanguagePickerProps) {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = async (locale: string) => {
    setSelectedLanguage(locale);
    i18n.changeLanguage(locale);
    
    // Save to AsyncStorage immediately
    await save(STORAGE_KEYS.LOCALE, locale);
    
    onChange?.(locale);
  };

  const isCompact = variant === "compact";

  const getFlag = (language: string) => {
    return language === "en" ? "🇺🇸" : "🇪🇸";
  };

  return (
    <View
      style={[
        styles.pickerContainer,
        isCompact && styles.pickerContainerCompact,
      ]}
    >
      {isCompact && (
        <Text style={styles.flagOverlay}>{getFlag(selectedLanguage)}</Text>
      )}
      <Picker
        selectedValue={selectedLanguage}
        onValueChange={handleLanguageChange}
        style={[styles.picker, isCompact && styles.pickerCompact]}
      >
        <Picker.Item label="🇺🇸 English" value="en" color="#000" />
        <Picker.Item label="🇪🇸 Español" value="es" color="#000" />
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
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    height: 60,
  },
  pickerCompact: {
    height: 40,
    width: 80,
    opacity: 0,
  },
  flagOverlay: {
    position: "absolute",
    fontSize: 24,
    bottom: 3,
    zIndex: 1,
    pointerEvents: "none",
  },
});
