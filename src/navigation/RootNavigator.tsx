import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { colors } from "../theme/colors";
import { useUser } from "../contexts/UserContext";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import HomeUserScreen from "../screens/HomeUserScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import AdminTabs from "./AdminTabs";

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  HomeUser: undefined;
  HomeAdmin: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    border: colors.border,
    primary: colors.teal,
    text: colors.text,
  },
};

export default function RootNavigator() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : user.role === "admin" ? (
          <>
            <Stack.Screen name="HomeAdmin" component={AdminTabs} />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ presentation: "card" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="HomeUser" component={HomeUserScreen} />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ presentation: "card" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
