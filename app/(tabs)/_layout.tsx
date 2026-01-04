import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { CustomTabBarButton } from "@/components/CustomTabBarButton";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  // const isTabHiddenScreen = HIDDEN_TABS_SCREENS.includes(location.pathname);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0a7ea4", // Force blue tint in all modes
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          // display: isTabHiddenScreen ? "none" : "flex",
          height: 90,
          paddingBottom: 20,
          overflow: "visible",
          backgroundColor: "#FFFFFF", // Force white background in all modes
          borderTopColor: "#E5E5E7", // Force light grey border in all modes
        },
      }}
    >
      <Tabs.Screen
        name="inventory"
        options={{
          title: t("tabs.inventory"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="update"
        options={{
          title: t("tabs.update"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="shippingbox.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("tabs.newOrders"),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <IconSymbol size={32} name="plus" color="white" />
            </CustomTabBarButton>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t("tabs.orders"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="doc.text.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="export-data"
        options={{
          href: null, // Hide from tab bar but keep in navigation
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          href: null, // Hide from tab bar but keep in navigation
        }}
      />
      <Tabs.Screen
        name="extra-fees"
        options={{
          href: null, // Hide from tab bar but keep in navigation
        }}
      />
    </Tabs>
  );
}
