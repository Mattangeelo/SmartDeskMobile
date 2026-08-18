import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, radius, spacing } from "../theme/colors";
import { loginUsuario, loginEmpresa } from "../services/authService";
import { useUser } from "../contexts/UserContext";
import { validateEmail } from "../utils/validators";
import { AuthUser } from "../types";
import FormField from "../components/FormField";
import Button from "../components/Button";

type Role = "usuario" | "empresa";
type Props = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: Props) {
  const { setUser } = useUser();
  const [role, setRole] = useState<Role>("usuario");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    if (!senha) errors.senha = "Senha é obrigatória";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const loginFn = role === "empresa" ? loginEmpresa : loginUsuario;
      const res = await loginFn({ email, senha });
      const authUser: AuthUser = {
        id: Number(res.user.id),
        email: res.user.email,
        role: res.user.role,
        nome: res.user.nome,
        razao_social: res.user.razao_social,
        id_empresa: res.user.id_empresa || Number(res.user.id),
      };
      setUser(authUser);
      // RootNavigator swaps stacks automatically once `user` updates.
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.brandIco}>
            <Ionicons name="server-outline" size={20} color="#fff" />
          </View>
          <Text style={styles.brandName}>
            Smart<Text style={{ color: colors.teal }}>Desk</Text>
          </Text>
        </View>

        <Text style={styles.formTitle}>Bem-vindo de volta</Text>
        <Text style={styles.formSub}>Entre com suas credenciais para acessar</Text>

        <Text style={styles.roleLabel}>Tipo de acesso</Text>
        <View style={styles.roles}>
          <RoleCard
            selected={role === "usuario"}
            onPress={() => setRole("usuario")}
            icon="person-outline"
            iconColor={colors.teal}
            title="Usuário"
            desc="Acesso como colaborador"
          />
          <RoleCard
            selected={role === "empresa"}
            onPress={() => setRole("empresa")}
            icon="business-outline"
            iconColor={colors.blue}
            title="Empresa"
            desc="Acesso administrativo"
          />
        </View>

        <FormField
          label="E-mail"
          icon="mail-outline"
          placeholder="seu@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
        />
        <View style={{ height: spacing.md }} />
        <FormField
          label="Senha"
          icon="lock-closed-outline"
          placeholder="********"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          error={fieldErrors.senha}
        />

        {error ? <Text style={styles.formError}>{error}</Text> : null}

        <Button
          title={loading ? "Autenticando..." : `Entrar como ${role === "empresa" ? "Empresa" : "Usuário"}`}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchTxt}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.switchLink}>Criar agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RoleCard({
  selected,
  onPress,
  icon,
  iconColor,
  title,
  desc,
}: {
  selected: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  desc: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.roleCard, selected && styles.roleCardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.roleCardHead}>
        <View style={[styles.roleIcon, { backgroundColor: `${iconColor}1a` }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <View style={[styles.radio, selected && { borderColor: colors.teal }]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </View>
      <Text style={styles.roleTitle}>{title}</Text>
      <Text style={styles.roleDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, paddingTop: spacing.xxl * 1.5, paddingBottom: spacing.xxl },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: spacing.xxl },
  brandIco: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 20, fontWeight: "bold", color: colors.text },
  formTitle: { fontSize: 24, fontWeight: "bold", color: colors.text, marginBottom: 4 },
  formSub: { fontSize: 13, color: colors.muted, marginBottom: spacing.xl },
  roleLabel: { fontSize: 12, textTransform: "uppercase", color: colors.muted, marginBottom: 10 },
  roles: { flexDirection: "row", gap: 10, marginBottom: spacing.xl },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    backgroundColor: colors.card,
    gap: 6,
  },
  roleCardSelected: { borderColor: colors.teal, backgroundColor: "#333b3a" },
  roleCardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  roleIcon: { width: 32, height: 32, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.teal },
  roleTitle: { fontSize: 13, fontWeight: "bold", color: colors.text },
  roleDesc: { fontSize: 12, color: colors.muted, lineHeight: 16 },
  formError: { color: colors.danger, fontSize: 13, marginTop: spacing.md, textAlign: "center" },
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
  switchTxt: { fontSize: 13, color: colors.muted },
  switchLink: { fontSize: 13, color: colors.teal, fontWeight: "600" },
});
