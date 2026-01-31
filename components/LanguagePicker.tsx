import { save, STORAGE_KEYS } from "@/redux/auth/secureStorage";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { ThemedPicker } from "./ThemedPicker";

interface LanguagePickerProps {
  variant?: "default" | "compact";
  onChange?: (locale: string) => void;
}

export function LanguagePicker({ variant = "default", onChange }: LanguagePickerProps) {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
      <ThemedPicker
        selectedValue={selectedLanguage}
        onValueChange={handleLanguageChange}
        style={[styles.picker, isCompact && styles.pickerCompact]}
        containerStyle={isCompact ? styles.pickerContainerCompactInner : undefined}
      >
        <ThemedPicker.Item label="🇺🇸 English" value="en" color="#000" />
        <ThemedPicker.Item label="🇪🇸 Español" value="es" color="#000" />
      </ThemedPicker>
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
  pickerContainerCompactInner: {
    backgroundColor: "transparent",
    borderRadius: 0,
  },
  flagOverlay: {
    position: "absolute",
    fontSize: 24,
    bottom: 3,
    zIndex: 1,
    pointerEvents: "none",
  },
});
