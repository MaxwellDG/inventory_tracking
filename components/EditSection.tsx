import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type DropdownItem = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  renderContent: () => React.ReactNode;
  shouldGlow?: boolean;
};

type EditSectionProps = {
  title: string;
  dropdownItems: DropdownItem[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  shouldGlow?: boolean;
};

function GlowingWrapper({
  children,
  shouldGlow,
  style,
  baseColor,
  glowColor,
}: {
  children: React.ReactNode;
  shouldGlow?: boolean;
  style?: ViewStyle;
  baseColor: string;
  glowColor: string;
}) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shouldGlow) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    } else {
      glowAnim.setValue(0);
    }
  }, [shouldGlow, glowAnim]);

  const animatedStyle = shouldGlow
    ? {
        backgroundColor: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [baseColor, glowColor],
        }),
      }
    : { backgroundColor: baseColor };

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

export function EditSection({
  title,
  dropdownItems,
  isExpanded,
  onToggleExpanded,
  shouldGlow,
}: EditSectionProps) {
  return (
    <>
      <GlowingWrapper
        shouldGlow={shouldGlow && !isExpanded}
        style={styles.sectionHeader}
        baseColor="#F8F9FA"
        glowColor="#E3F2FD"
      >
        <TouchableOpacity
          style={styles.sectionHeaderInner}
          onPress={onToggleExpanded}
        >
          <ThemedText style={styles.sectionHeaderText}>{title}</ThemedText>
          <IconSymbol
            name={isExpanded ? "chevron.up" : "chevron.down"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </GlowingWrapper>

      {isExpanded &&
        dropdownItems.map((item, index) => (
          <View key={index} style={styles.dropdownSection}>
            <GlowingWrapper
              shouldGlow={item.shouldGlow}
              style={styles.dropdownInner}
              baseColor="#FFFFFF"
              glowColor="#E3F2FD"
            >
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={item.onToggle}
              >
                <ThemedText style={styles.dropdownTitle}>
                  {item.title}
                </ThemedText>
              </TouchableOpacity>

              {item.isOpen && (
                <View style={styles.dropdownContent}>
                  {item.renderContent()}
                </View>
              )}
            </GlowingWrapper>
          </View>
        ))}
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    marginBottom: 8,
    borderRadius: 4,
  },
  sectionHeaderInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dropdownSection: {
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownInner: {
    borderRadius: 12,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  dropdownContent: {
    padding: 16,
  },
});
