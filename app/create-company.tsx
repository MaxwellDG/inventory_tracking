import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { updateUser } from "@/redux/auth/slice";
import { useCreateCompanyMutation } from "@/redux/company/apiSlice";
import { RootState } from "@/redux/store";
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
import { useDispatch, useSelector } from "react-redux";

export default function CreateCompanyScreen() {
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState("");
  const dispatch = useDispatch();

  const [createCompany, { isLoading }] = useCreateCompanyMutation();

  // DEBUG: Check auth state
  const authState = useSelector((state: RootState) => state.auth);

  // const handlePickImage = async () => {
  //   // Request permission
  //   const permissionResult =
  //     await ImagePicker.requestMediaLibraryPermissionsAsync();

  //   if (permissionResult.granted === false) {
  //     Alert.alert(
  //       t("createCompany.permissionRequired"),
  //       t("createCompany.permissionMessage")
  //     );
  //     return;
  //   }

  //   // Open image picker
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.8,
  //   });

  //   if (!result.canceled && result.assets[0]) {
  //     setImageUri(result.assets[0].uri);
  //   }
  // };

  const handleContinue = async () => {
    await createCompany({ name: companyName })
      .unwrap()
      .then((response) => {
        // Update user in Redux with the new company_id
        dispatch(updateUser({ company_id: response.data.id }));
        router.replace("/(tabs)/inventory");
      })
      .catch((error) => {
        Alert.alert(t("createCompany.error"), error.data.message);
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.content}>
        <View style={styles.centerContent}>
          <ThemedText type="title" style={styles.title}>
            {t("createCompany.title")}
          </ThemedText>

          {/* <TouchableOpacity
            style={styles.imagePicker}
            onPress={handlePickImage}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <IconSymbol name="camera.fill" size={40} color="#999" />
                <ThemedText style={styles.imagePlaceholderText}>
                  {t("createCompany.addLogo")}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity> */}

          <TextInput
            style={styles.input}
            placeholder={t("createCompany.placeholder")}
            placeholderTextColor="#999"
            value={companyName}
            onChangeText={setCompanyName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[
              styles.button,
              !companyName.trim() && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!companyName.trim() || isLoading}
          >
            <ThemedText style={styles.buttonText}>
              {t("createCompany.continue")}
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
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E1E5E9",
    borderStyle: "dashed",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
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
