import { ThemedText } from "@/components/themed-text";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface TooltipProps {
  content: string;
  iconSize?: number;
  iconColor?: string;
}

export function Tooltip({
  content,
  iconSize = 16,
  iconColor = "#999",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handlePress = (event: any) => {
    if (!visible) {
      event.target.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          setPosition({ x: pageX, y: pageY + height + 4 });
          setVisible(true);
        }
      );
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.iconContainer}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.questionMark}>?</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.tooltipContainer,
                {
                  top: position.y,
                  left: Math.max(16, Math.min(position.x - 100, 300)),
                },
              ]}
            >
              <View style={styles.tooltipArrow} />
              <View style={styles.tooltipContent}>
                <ThemedText style={styles.tooltipText}>{content}</ThemedText>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 4,
  },
  iconCircle: {
    backgroundColor: "#E5E5E5",
    borderRadius: 100,
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  questionMark: {
    color: "#666",
    fontSize: 9,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  tooltipContainer: {
    position: "absolute",
    width: 250,
    zIndex: 1000,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFFFFF",
    alignSelf: "flex-start",
    marginLeft: 100,
  },
  tooltipContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  tooltipText: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },
});
