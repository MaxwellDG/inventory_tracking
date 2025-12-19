import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function CompanyScreen() {
  const { t } = useTranslation();

  const handleCreateCompany = () => {
    router.push("/create-company");
  };

  const handleJoinCompany = () => {
    router.push("/join-company");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {t("company.title")}
        </ThemedText>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleCreateCompany}>
            <ThemedText style={styles.buttonText}>
              {t("company.createNew")}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleJoinCompany}
          >
            <ThemedText style={styles.secondaryButtonText}>
              {t("company.joinExisting")}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    textAlign: "left",
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 32,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
});
