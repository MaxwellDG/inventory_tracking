import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SliderProps {
  value: boolean; // true = left option, false = right option
  onValueChange: (value: boolean) => void;
  leftLabel: string;
  rightLabel: string;
  leftColor?: string;
  rightColor?: string;
}

export function Slider({
  value,
  onValueChange,
  leftLabel,
  rightLabel,
  leftColor = "#007AFF",
  rightColor = "#FF3B30",
}: SliderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          styles.leftOption,
          value && { backgroundColor: leftColor },
        ]}
        onPress={() => onValueChange(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.optionText, value && styles.selectedText]}>
          {leftLabel}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          styles.rightOption,
          !value && { backgroundColor: rightColor },
        ]}
        onPress={() => onValueChange(false)}
        activeOpacity={0.8}
      >
        <Text style={[styles.optionText, !value && styles.selectedText]}>
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
  },
  leftOption: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightOption: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  selectedText: {
    color: "#FFFFFF",
  },
});

