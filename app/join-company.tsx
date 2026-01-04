import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useApiError } from "@/hooks/use-api-error";
import { updateUser } from "@/redux/auth/slice";
import { useJoinCompanyMutation } from "@/redux/company/apiSlice";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

export default function JoinCompanyScreen() {
  const { t } = useTranslation();
  const { showError } = useApiError();
  const [companyId, setCompanyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [joinCompany, { isLoading: isJoining }] = useJoinCompanyMutation();
  const dispatch = useDispatch();

  const handleContinue = async () => {
    if (!companyId.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await joinCompany({ company_id: parseInt(companyId) }).unwrap();
      dispatch(updateUser({ company_id: response.company.id }));
      router.replace("/(tabs)/inventory");
    } catch (error) {
      showError(error, t("joinCompany.failedToJoin"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.content}>
        <View style={styles.centerContent}>
          <ThemedText type="title" style={styles.title}>
            {t("joinCompany.title")}
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder={t("joinCompany.placeholder")}
            placeholderTextColor="#999"
            value={companyId}
            onChangeText={setCompanyId}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={[styles.button, !companyId.trim() && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!companyId.trim() || isLoading}
          >
            <ThemedText style={styles.buttonText}>
              {t("joinCompany.continue")}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centerContent: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 32,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
    marginBottom: 20,
    color: "#000",
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
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
});
