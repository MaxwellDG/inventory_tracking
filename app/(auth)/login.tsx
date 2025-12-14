import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useApiError } from "@/hooks/use-api-error";
import { useLoginMutation } from "@/redux/auth/apiSlice";
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

export default function LoginScreen() {
  const { t } = useTranslation();
  const { showError } = useApiError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(t("login.error"), t("login.enterEmail"));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(t("login.error"), t("login.enterValidEmail"));
      return;
    }

    if (!password.trim()) {
      Alert.alert(t("login.error"), t("login.enterPassword"));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t("login.error"), t("login.passwordMinLength"));
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();

      // Update Redux state
      dispatch(setCredentials(result));

      // Persist auth data to storage
      if (result.refresh_token) {
        await saveSecure(STORAGE_KEYS.REFRESH_TOKEN, result.refresh_token);
      }
      if (result.token) {
        await save(STORAGE_KEYS.ACCESS_TOKEN, result.token);
      }

      // Navigate to inventory tab
      router.replace("/(tabs)/inventory");
    } catch (error) {
      showError(error, t("login.loginFailed"));
    }
  };

  const handleSignUp = () => {
    router.push("/(auth)/register");
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
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
              {t("login.title")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t("login.subtitle")}
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {t("login.emailLabel")}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("login.emailPlaceholder")}
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
                {t("login.passwordLabel")}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={t("login.passwordPlaceholder")}
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <ThemedText style={styles.forgotPasswordText}>
                {t("login.forgotPassword")}
              </ThemedText>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <ThemedText style={styles.loginButtonText}>
                {isLoading ? t("login.signingIn") : t("login.signIn")}
              </ThemedText>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>
                {t("login.footerText")}{" "}
              </ThemedText>
              <TouchableOpacity onPress={handleSignUp}>
                <ThemedText style={styles.signUpText}>
                  {t("login.signUp")}
                </ThemedText>
              </TouchableOpacity>
            </View>
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 35
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signUpText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
