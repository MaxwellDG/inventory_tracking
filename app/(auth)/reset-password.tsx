import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useApiError } from "@/hooks/use-api-error";
import { useResetPasswordMutation } from "@/redux/auth/apiSlice";
import { router, useLocalSearchParams } from "expo-router";
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

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { showError } = useApiError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { token } = useLocalSearchParams();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(t("resetPassword.error"), t("resetPassword.enterEmail"));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(
        t("resetPassword.error"),
        t("resetPassword.enterValidEmail")
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert(t("resetPassword.error"), t("resetPassword.enterNewPassword"));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t("resetPassword.error"), t("resetPassword.passwordMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("resetPassword.error"), t("resetPassword.passwordsDoNotMatch"));
      return;
    }

    if (!token) {
      Alert.alert(t("resetPassword.error"), t("resetPassword.invalidToken"));
      return;
    }

    try {
      await resetPassword({
        email,
        password,
        password_confirmation: confirmPassword,
        token: token as string,
      }).unwrap();
      Alert.alert(
        t("resetPassword.success"),
        t("resetPassword.passwordResetSuccess"),
        [
          {
            text: t("resetPassword.ok"),
            onPress: () => router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (error) {
      showError(error, t("resetPassword.failedToReset"));
    }
  };

  const handleBackToLogin = () => {
    router.replace("/(auth)/login");
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
              {t("resetPassword.title")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t("resetPassword.subtitle")}
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t("resetPassword.emailLabel")}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("resetPassword.emailPlaceholder")}
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t("resetPassword.newPasswordLabel")}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("resetPassword.newPasswordPlaceholder")}
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t("resetPassword.confirmNewPasswordLabel")}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("resetPassword.confirmNewPasswordPlaceholder")}
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.resetButton,
                isLoading && styles.resetButtonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <ThemedText style={styles.resetButtonText}>
                {isLoading
                  ? t("resetPassword.resetting")
                  : t("resetPassword.resetPassword")}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              {t("resetPassword.footerText")}{" "}
            </ThemedText>
            <TouchableOpacity onPress={handleBackToLogin}>
              <ThemedText style={styles.signInText}>
                {t("resetPassword.signIn")}
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
