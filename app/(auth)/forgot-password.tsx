import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useApiError } from "@/hooks/use-api-error";
import { useForgotPasswordMutation } from "@/redux/auth/apiSlice";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { showError } = useApiError();
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(t("forgotPassword.error"), t("forgotPassword.enterEmail"));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(
        t("forgotPassword.error"),
        t("forgotPassword.enterValidEmail")
      );
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      Alert.alert(
        t("forgotPassword.success"),
        t("forgotPassword.resetLinkSent"),
        [
          {
            text: t("forgotPassword.ok"),
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      showError(error, t("forgotPassword.failedToSend"));
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {t("forgotPassword.title")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t("forgotPassword.subtitle")}
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t("forgotPassword.emailLabel")}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("forgotPassword.emailPlaceholder")}
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.resetButton,
                isLoading && styles.resetButtonDisabled,
              ]}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <ThemedText style={styles.resetButtonText}>
                {isLoading
                  ? t("forgotPassword.sending")
                  : t("forgotPassword.sendResetLink")}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              {t("forgotPassword.footerText")}{" "}
            </ThemedText>
            <TouchableOpacity onPress={handleBackToLogin}>
              <ThemedText style={styles.signInText}>
                {t("forgotPassword.signIn")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  resetButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  resetButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  footerText: {
    fontSize: 16,
  },
  signInText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});
