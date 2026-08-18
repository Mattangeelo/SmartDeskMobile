import { View, Text, TextInput, TextInputProps, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme/colors";

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string | null;
}

export default function FormField({ label, icon, error, style, ...rest }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.wrap}>
        {icon && <Ionicons name={icon} size={16} color={colors.muted} style={styles.icon} />}
        <TextInput
          placeholderTextColor={colors.muted}
          style={[styles.input, icon ? { paddingLeft: 38 } : null, style]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 12, textTransform: "uppercase", color: colors.muted },
  wrap: { position: "relative", justifyContent: "center" },
  icon: { position: "absolute", left: 12, zIndex: 1 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 14,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 2 },
});
