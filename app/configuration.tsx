import { LanguagePicker } from "@/components/LanguagePicker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useToast } from "@/contexts/ToastContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

export default function ConfigurationScreen() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const handleLanguageChange = (locale: string) => {
    // Language is already saved to AsyncStorage and changed in i18n by LanguagePicker
    showToast(t("configuration.languageChanged"), "success");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>
            {t("configuration.language")}
          </ThemedText>
          <LanguagePicker onChange={handleLanguageChange} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
});
