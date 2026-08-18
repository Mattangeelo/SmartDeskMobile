import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, radius, spacing } from "../theme/colors";
import { createUsuario } from "../services/usuarioService";
import { createEmpresa } from "../services/empresaService";
import {
  validateEmail,
  validateCPF,
  validatePassword,
  validatePasswordMatch,
  formatCPF,
  formatCNPJ,
} from "../utils/validators";
import FormField from "../components/FormField";
import Button from "../components/Button";

type Role = "usuario" | "empresa";
type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
  const [role, setRole] = useState<Role>("usuario");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [idEmpresa, setIdEmpresa] = useState("1");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const validateUsuarioForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!nome.trim()) errors.nome = "Nome é obrigatório";
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const cpfErr = validateCPF(cpf);
    if (cpfErr) errors.cpf = cpfErr;
    const senhaErr = validatePassword(senha);
    if (senhaErr) errors.senha = senhaErr;
    const matchErr = validatePasswordMatch(senha, confirmar);
    if (matchErr) errors.confirmar = matchErr;
    if (!idEmpresa) errors.id_empresa = "ID da empresa é obrigatório";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEmpresaForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!razaoSocial.trim() || razaoSocial.length < 5) errors.razao_social = "Mínimo 5 caracteres";
    const cnpjDigits = cnpj.replace(/\D/g, "");
    if (cnpjDigits.length !== 14) errors.cnpj = "CNPJ deve ter 14 dígitos";
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    const senhaErr = validatePassword(senha);
    if (senhaErr) errors.senha = senhaErr;
    const matchErr = validatePasswordMatch(senha, confirmar);
    if (matchErr) errors.confirmar = matchErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError("");
    if (role === "usuario") {
      if (!validateUsuarioForm()) return;
      setLoading(true);
      try {
        await createUsuario({ nome, email, senha, cpf, id_empresa: Number(idEmpresa) });
        navigation.navigate("SignIn");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao cadastrar usuário");
      } finally {
        setLoading(false);
      }
    } else {
      if (!validateEmpresaForm()) return;
      setLoading(true);
      try {
        await createEmpresa({ razao_social: razaoSocial, cnpj, email, senha });
        navigation.navigate("SignIn");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao registrar empresa");
      } finally {
        setLoading(false);
      }
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

        <Text style={styles.formTitle}>
          {role === "empresa" ? "Sua empresa no SmartDesk" : "Comece a resolver tickets"}
        </Text>
        <Text style={styles.formSub}>
          {role === "empresa"
            ? "Registre sua empresa e comece a gerenciar sua equipe de suporte."
            : "Crie sua conta de colaborador e vincule-se à sua empresa."}
        </Text>

        <Text style={styles.roleLabel}>Tipo de conta</Text>
        <View style={styles.roles}>
          <RoleChip label="Usuário" selected={role === "usuario"} onPress={() => setRole("usuario")} />
          <RoleChip label="Empresa" selected={role === "empresa"} onPress={() => setRole("empresa")} />
        </View>

        {role === "usuario" ? (
          <View style={{ gap: spacing.md }}>
            <FormField label="Nome completo" icon="person-outline" placeholder="Seu nome" value={nome} onChangeText={setNome} error={fieldErrors.nome} />
            <FormField label="E-mail" icon="mail-outline" placeholder="seu@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} error={fieldErrors.email} />
            <FormField label="CPF" icon="card-outline" placeholder="000.000.000-00" value={cpf} onChangeText={(v) => setCpf(formatCPF(v))} keyboardType="numeric" error={fieldErrors.cpf} />
            <FormField label="ID da empresa" icon="business-outline" placeholder="Ex: 1" value={idEmpresa} onChangeText={setIdEmpresa} keyboardType="numeric" error={fieldErrors.id_empresa} />
            <FormField label="Senha" icon="lock-closed-outline" placeholder="********" secureTextEntry value={senha} onChangeText={setSenha} error={fieldErrors.senha} />
            <FormField label="Confirmar senha" icon="lock-closed-outline" placeholder="********" secureTextEntry value={confirmar} onChangeText={setConfirmar} error={fieldErrors.confirmar} />
            {error ? <Text style={styles.formError}>{error}</Text> : null}
            <Button title={loading ? "Criando conta..." : "Criar conta de usuário"} onPress={handleSubmit} loading={loading} fullWidth />
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <FormField label="Razão social" icon="business-outline" placeholder="Empresa Ltda" value={razaoSocial} onChangeText={setRazaoSocial} error={fieldErrors.razao_social} />
            <FormField label="CNPJ" icon="card-outline" placeholder="00.000.000/0001-00" value={cnpj} onChangeText={(v) => setCnpj(formatCNPJ(v))} keyboardType="numeric" error={fieldErrors.cnpj} />
            <FormField label="E-mail" icon="mail-outline" placeholder="admin@empresa.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} error={fieldErrors.email} />
            <FormField label="Senha" icon="lock-closed-outline" placeholder="********" secureTextEntry value={senha} onChangeText={setSenha} error={fieldErrors.senha} />
            <FormField label="Confirmar senha" icon="lock-closed-outline" placeholder="********" secureTextEntry value={confirmar} onChangeText={setConfirmar} error={fieldErrors.confirmar} />
            {error ? <Text style={styles.formError}>{error}</Text> : null}
            <Button title={loading ? "Registrando..." : "Registrar empresa"} onPress={handleSubmit} loading={loading} fullWidth />
          </View>
        )}

        <View style={styles.switchRow}>
          <Text style={styles.switchTxt}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.switchLink}>Entrar agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RoleChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
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
  formTitle: { fontSize: 22, fontWeight: "bold", color: colors.text, marginBottom: 4 },
  formSub: { fontSize: 13, color: colors.muted, marginBottom: spacing.xl, lineHeight: 18 },
  roleLabel: { fontSize: 12, textTransform: "uppercase", color: colors.muted, marginBottom: 10 },
  roles: { flexDirection: "row", gap: 10, marginBottom: spacing.xl },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
  },
  chipSelected: { borderColor: colors.teal, backgroundColor: "#333b3a" },
  chipText: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  chipTextSelected: { color: colors.teal },
  formError: { color: colors.danger, fontSize: 13, textAlign: "center" },
  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
  switchTxt: { fontSize: 13, color: colors.muted },
  switchLink: { fontSize: 13, color: colors.teal, fontWeight: "600" },
});
