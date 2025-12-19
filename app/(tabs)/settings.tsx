import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/contexts/ToastContext";
import { useLogoutMutation } from "@/redux/auth/apiSlice";
import { clearAllAuthData } from "@/redux/auth/secureStorage";
import { clearCredentials } from "@/redux/auth/slice";
import { useGetCompanyQuery } from "@/redux/company/apiSlice";
import { UserCompany } from "@/redux/company/types";
import { RootState } from "@/redux/store";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const { data: companyData } = useGetCompanyQuery(user?.company_id || 0, {
    skip: !user?.company_id,
  });

  const company = companyData?.data as UserCompany;

  const handleCopyCompanyId = async () => {
    if (company?.id) {
      await Clipboard.setStringAsync(company.id.toString());
      showToast(t("settings.companyIdCopied"), "success");
    }
  };

  const handleExportData = () => {
    router.push("/export-data");
  };

  const handleLogout = () => {
    Alert.alert(t("settings.logoutTitle"), t("settings.logoutConfirm"), [
      {
        text: t("settings.cancel"),
        style: "cancel",
      },
      {
        text: t("settings.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await logout().unwrap();
          } catch (error) {
            console.error("Logout API call failed:", error);
            // Continue with logout even if server call fails
          } finally {
            // Clear all persisted auth data
            await clearAllAuthData();
            // Clear Redux state
            dispatch(clearCredentials());
            // Navigation will be handled automatically by _layout.tsx useEffect
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {t("settings.title")}
      </ThemedText>

      {/* Company Info Subtitle */}
      {company && (
        <View style={styles.companyInfo}>
          <Text style={styles.companyText}>
            {company.name} #{company.id}
          </Text>
          <TouchableOpacity onPress={handleCopyCompanyId}>
            <IconSymbol name="doc.on.doc" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* User Info Section */}
      {user && (
        <View style={styles.section}>
          <View style={styles.userInfo}>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportData}
        >
          <View style={styles.exportContent}>
            <IconSymbol name="square.and.arrow.up" size={24} color="#007AFF" />
            <Text style={styles.exportText}>{t("settings.exportData")}</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => router.push("/members")}
        >
          <View style={styles.exportContent}>
            <IconSymbol name="person.2.fill" size={24} color="#007AFF" />
            <Text style={styles.exportText}>{t("settings.members")}</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => router.push("/extra-fees")}
        >
          <View style={styles.exportContent}>
            <IconSymbol name="building.2.fill" size={24} color="#007AFF" />
            <Text style={styles.exportText}>{t("settings.extraFees")}</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => router.push("/configuration")}
        >
          <View style={styles.exportContent}>
            <IconSymbol name="gearshape.fill" size={24} color="#007AFF" />
            <Text style={styles.exportText}>{t("settings.configuration")}</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLoading && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <View style={styles.logoutContent}>
            <IconSymbol
              name="rectangle.portrait.and.arrow.right"
              size={24}
              color="#FF3B30"
            />
            <Text style={styles.logoutText}>
              {isLoading ? t("settings.loggingOut") : t("settings.logout")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 20,
  },
  companyText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  section: {
    marginBottom: 30,
  },
  exportButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  exportContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  exportText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  userInfo: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#fff5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fed7d7",
  },
  logoutButtonDisabled: {
    backgroundColor: "#f7f7f7",
    borderColor: "#e0e0e0",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF3B30",
    marginLeft: 12,
  },
});
