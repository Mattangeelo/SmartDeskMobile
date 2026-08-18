import { View, Text, StyleSheet } from "react-native";

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
}

export default function Badge({ label, color, bg }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
});
