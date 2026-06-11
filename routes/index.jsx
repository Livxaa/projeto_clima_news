import IonicIcon from "@expo/vector-icons/Ionicons";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { AppProvider, useApp } from "../context/AppContext";
import Cadastro from "../app/pages/cadastro";
import Dashboard from "../app/pages/dashboard";
import Login from "../app/pages/login";
import Registro from "../app/pages/registro";
import Relatorio from "../app/pages/relatorio";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: "#0f172a", // Deep space slate
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#f8fafc",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#38bdf8", // Ambient Sky Blue
        tabBarInactiveTintColor: "#64748b",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "cloud-outline";

          if (route.name === "Estação") {
            iconName = focused ? "partly-sunny" : "partly-sunny-outline";
          } else if (route.name === "Registrar") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Relatórios") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          }

          return <IonicIcon name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Estação" 
        component={Dashboard} 
        options={{ title: "Estação Meteorológica" }} 
      />
      <Tab.Screen 
        name="Registrar" 
        component={Registro} 
        options={{ title: "Registrar Clima" }} 
      />
      <Tab.Screen 
        name="Relatórios" 
        component={Relatorio} 
        options={{ title: "Relatório de Dados" }} 
      />
    </Tab.Navigator>
  );
}

function RotasContent() {
  const { loading, currentUser } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0b1329" }}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={{ color: "#f8fafc", marginTop: 12, fontSize: 16 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={currentUser ? "Inicio" : "login"}
    >
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="cadastro" component={Cadastro} />
      <Stack.Screen name="Inicio" component={HomeTabs} />
    </Stack.Navigator>
  );
}

export default function Rotas() {
  return (
    <AppProvider>
      <RotasContent />
    </AppProvider>
  );
}
