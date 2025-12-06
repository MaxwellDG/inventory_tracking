import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

export function useApiError() {
  const { t } = useTranslation();

  const showError = useCallback(
    (error: any, fallbackMessage?: string) => {
      const message =
        error?.data?.message ||
        fallbackMessage ||
        t("common.error.unknownError");
      Alert.alert(t("common.error.title"), message);
    },
    [t]
  );

  return { showError };
}
