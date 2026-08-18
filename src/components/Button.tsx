import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  style,
  fullWidth,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "ghost" && styles.ghost,
        variant === "danger" && styles.danger,
        fullWidth && { width: "100%" },
        isDisabled && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "ghost" ? colors.muted : "#fff"} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={14}
              color={variant === "ghost" ? colors.muted : "#fff"}
              style={{ marginRight: 6 }}
            />
          )}
          <Text
            style={[
              styles.text,
              variant === "ghost" && { color: colors.muted },
              variant !== "ghost" && { color: "#fff" },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
  },
  primary: { backgroundColor: colors.teal },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.danger },
  text: { fontSize: 13, fontWeight: "700" },
});
