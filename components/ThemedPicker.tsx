import { Picker, PickerProps } from "@react-native-picker/picker";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface ThemedPickerProps<T> extends PickerProps<T> {
  containerStyle?: ViewStyle;
}

export function ThemedPicker<T>({
  children,
  style,
  containerStyle,
  ...props
}: ThemedPickerProps<T>) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Picker
        {...props}
        style={[styles.picker, style]}
        itemStyle={styles.pickerItem}
        dropdownIconColor="#000000"
      >
        {children}
      </Picker>
    </View>
  );
}

ThemedPicker.Item = Picker.Item;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  pickerItem: {
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
});
