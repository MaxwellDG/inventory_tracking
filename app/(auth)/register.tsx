import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useApiError } from "@/hooks/use-api-error";
import { useRegisterMutation } from "@/redux/auth/apiSlice";
import { save, saveSecure, STORAGE_KEYS } from "@/redux/auth/secureStorage";
import { setCredentials } from "@/redux/auth/slice";
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
import { useDispatch } from "react-redux";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { showError } = useApiError();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert(t("register.error"), t("register.enterName"));
      return;
    }

    if (!email.trim()) {
      Alert.alert(t("register.error"), t("register.enterEmail"));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(t("register.error"), t("register.enterValidEmail"));
      return;
    }

    if (!password.trim()) {
      Alert.alert(t("register.error"), t("register.enterPassword"));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t("register.error"), t("register.passwordMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("register.error"), t("register.passwordsDoNotMatch"));
      return;
    }

    try {
      const result = await register({
        name,
        email: email.toLowerCase(),
        password,
        password_confirmation: confirmPassword,
      }).unwrap();

      // Update Redux state
      dispatch(setCredentials(result));

      // Persist auth data to storage
      if (result.refresh_token) {
        await saveSecure(STORAGE_KEYS.REFRESH_TOKEN, result.refresh_token);
      }
      if (result.token) {
        await save(STORAGE_KEYS.ACCESS_TOKEN, result.token);
      }

      router.replace("/company");
    } catch (error) {
      showError(error, t("register.registrationFailed"));
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
              {t("register.title")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t("register.subtitle")}
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t("register.nameLabel")}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("register.namePlaceholder")}
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t("register.emailLabel")}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("register.emailPlaceholder")}
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
                {t("register.passwordLabel")}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("register.passwordPlaceholder")}
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
                {t("register.confirmPasswordLabel")}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("register.confirmPasswordPlaceholder")}
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
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <ThemedText style={styles.registerButtonText}>
                {isLoading
                  ? t("register.creatingAccount")
                  : t("register.createAccount")}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              {t("register.footerText")}{" "}
            </ThemedText>
            <TouchableOpacity onPress={handleBackToLogin}>
              <ThemedText style={styles.signInText}>
                {t("register.signIn")}
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
    color: "#000",
  },
  registerButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signInText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
