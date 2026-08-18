import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAdminData, AdminDataProvider } from "../contexts/AdminDataContext";
import DashboardScreen from "../screens/admin/DashboardScreen";
import AdminTicketsScreen from "../screens/admin/AdminTicketsScreen";
import UsuariosScreen from "../screens/admin/UsuariosScreen";
import PendentesScreen from "../screens/admin/PendentesScreen";
import DepartamentosScreen from "../screens/admin/DepartamentosScreen";

export type AdminTabParamList = {
  Dashboard: undefined;
  Tickets: { deptFilter?: string } | undefined;
  Usuarios: undefined;
  Pendentes: undefined;
  Departamentos: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

const ICONS: Record<keyof AdminTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: "grid-outline",
  Tickets: "document-text-outline",
  Usuarios: "people-outline",
  Pendentes: "person-add-outline",
  Departamentos: "business-outline",
};

const LABELS: Record<keyof AdminTabParamList, string> = {
  Dashboard: "Dashboard",
  Tickets: "Tickets",
  Usuarios: "Usuários",
  Pendentes: "Pendentes",
  Departamentos: "Deptos",
};

function ProfileButton({ navigation }: { navigation: any }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.getParent()?.navigate("EditProfile")}
      style={{ marginRight: 16 }}
      hitSlop={10}
    >
      <Ionicons name="person-circle-outline" size={24} color={colors.muted} />
    </TouchableOpacity>
  );
}

function AdminTabsInner() {
  const { pendentes } = useAdminData();

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontSize: 17, fontWeight: "bold" as const },
        headerShadowVisible: false,
        headerRight: () => <ProfileButton navigation={navigation} />,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof AdminTabParamList]} size={size - 4} color={color} />
        ),
        tabBarLabel: LABELS[route.name as keyof AdminTabParamList],
        tabBarBadge:
          route.name === "Pendentes" && pendentes.length > 0 ? pendentes.length : undefined,
        tabBarBadgeStyle: { backgroundColor: colors.amber, color: "#000" },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Dashboard" }} />
      <Tab.Screen name="Tickets" component={AdminTicketsScreen} options={{ title: "Gestão de Tickets" }} />
      <Tab.Screen name="Usuarios" component={UsuariosScreen} options={{ title: "Gestão de Usuários" }} />
      <Tab.Screen name="Pendentes" component={PendentesScreen} options={{ title: "Usuários Pendentes" }} />
      <Tab.Screen name="Departamentos" component={DepartamentosScreen} options={{ title: "Departamentos" }} />
    </Tab.Navigator>
  );
}

export default function AdminTabs() {
  return (
    <AdminDataProvider>
      <AdminTabsInner />
    </AdminDataProvider>
  );
}
