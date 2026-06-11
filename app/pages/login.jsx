import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  StatusBar,
} from "react-native";
import IonicIcon from "@expo/vector-icons/Ionicons";
import { useApp } from "../../context/AppContext";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser } = useApp();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    const result = loginUser(email, password);
    if (result.success) {
      navigation.replace("Inicio");
    } else {
      Alert.alert("Erro de Login", result.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor="#0b1329" />
      <View style={styles.headerContainer}>
        <IonicIcon name="thunderstorm-outline" size={80} color="#38bdf8" />
        <Text style={styles.appTitle}>Nimbus Clima</Text>
        <Text style={styles.appSubtitle}>Estação de Monitoramento Meteorológico</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.title}>Acessar Canal</Text>
        <Text style={styles.subtitle}>Conecte-se para ler os sensores</Text>

        <View style={styles.inputWrapper}>
          <IonicIcon name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail da Estação"
            keyboardType="email-address"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <IonicIcon name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Chave de Acesso"
            secureTextEntry
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Monitoramento</Text>
          <IonicIcon name="arrow-forward-outline" size={18} color="#ffffff" style={styles.buttonIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("cadastro")} style={styles.linkButton}>
          <Text style={styles.helpText}>Não possui credenciais? <Text style={styles.linkText}>Cadastre-se</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0b1329", // Twilight dark blue
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f8fafc",
    marginTop: 12,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
  },
  box: {
    backgroundColor: "rgba(30, 41, 59, 0.7)", // Semi-transparent card
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: "#f8fafc",
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#0284c7", // Premium light blue accent
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  linkButton: {
    marginTop: 20,
  },
  helpText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 14,
  },
  linkText: {
    color: "#38bdf8",
    fontWeight: "600",
  },
});
