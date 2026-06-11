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
import { Picker } from "@react-native-picker/picker";
import { useApp } from "../../context/AppContext";

const CONDITIONS = [
  "Ensolarado",
  "Parcialmente Nublado",
  "Nublado",
  "Chuvoso",
  "Tempestade",
  "Névoa",
];

const LOCATIONS = [
  "Estação Central",
  "Estação Norte",
  "Estação Sul",
  "Estação Leste",
  "Estação Oeste",
];

export default function Registro({ navigation }) {
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [pressure, setPressure] = useState("");
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const { addWeatherLog } = useApp();

  const getCurrentTimestamp = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${day}/${month} - ${hours}:${minutes}`;
  };

  const handleSave = () => {
    const temp = parseFloat(temperature);
    const hum = parseFloat(humidity);
    const pres = parseFloat(pressure);

    if (isNaN(temp) || isNaN(hum) || isNaN(pres)) {
      Alert.alert("Erro", "Preencha todos os campos numéricos corretamente.");
      return;
    }

    if (temp < -50 || temp > 60) {
      Alert.alert("Erro", "Temperatura inválida. Insira um valor entre -50°C e 60°C.");
      return;
    }

    if (hum < 0 || hum > 100) {
      Alert.alert("Erro", "Umidade inválida. Insira um valor entre 0% e 100%.");
      return;
    }

    if (pres < 800 || pres > 1100) {
      Alert.alert("Erro", "Pressão inválida. Insira um valor entre 800 hPa e 1100 hPa.");
      return;
    }

    const log = {
      temperature: temp,
      humidity: hum,
      pressure: pres,
      condition,
      location,
      timestamp: getCurrentTimestamp(),
    };

    addWeatherLog(log);
    Alert.alert("Sucesso", "Registro climático salvo com sucesso!", [
      { text: "OK", onPress: () => navigation.navigate("Estação") },
    ]);

    setTemperature("");
    setHumidity("");
    setPressure("");
    setCondition(CONDITIONS[0]);
    setLocation(LOCATIONS[0]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor="#0b1329" />
      <View style={styles.headerContainer}>
        <IonicIcon name="add-circle-outline" size={70} color="#38bdf8" />
        <Text style={styles.appTitle}>Registrar Clima</Text>
        <Text style={styles.appSubtitle}>Insira os dados da leitura atual</Text>
      </View>

      <View style={styles.box}>
        {/* Temperature */}
        <View style={styles.inputWrapper}>
          <IonicIcon name="thermometer-outline" size={20} color="#f43f5e" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Temperatura (°C)"
            placeholderTextColor="#64748b"
            keyboardType="decimal-pad"
            value={temperature}
            onChangeText={setTemperature}
          />
        </View>

        {/* Humidity */}
        <View style={styles.inputWrapper}>
          <IonicIcon name="water-outline" size={20} color="#38bdf8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Umidade (%)"
            placeholderTextColor="#64748b"
            keyboardType="decimal-pad"
            value={humidity}
            onChangeText={setHumidity}
          />
        </View>

        {/* Pressure */}
        <View style={styles.inputWrapper}>
          <IonicIcon name="speedometer-outline" size={20} color="#a78bfa" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Pressão Atmosférica (hPa)"
            placeholderTextColor="#64748b"
            keyboardType="decimal-pad"
            value={pressure}
            onChangeText={setPressure}
          />
        </View>

        {/* Condition Picker */}
        <View style={styles.pickerWrapper}>
          <IonicIcon name="cloud-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <Picker
            selectedValue={condition}
            onValueChange={(itemValue) => setCondition(itemValue)}
            style={styles.picker}
            dropdownIconColor="#f8fafc"
          >
            {CONDITIONS.map((cond) => (
              <Picker.Item key={cond} label={cond} value={cond} color="#0f172a" />
            ))}
          </Picker>
        </View>

        {/* Location Picker */}
        <View style={styles.pickerWrapper}>
          <IonicIcon name="location-outline" size={20} color="#10b981" style={styles.inputIcon} />
          <Picker
            selectedValue={location}
            onValueChange={(itemValue) => setLocation(itemValue)}
            style={styles.picker}
            dropdownIconColor="#f8fafc"
          >
            {LOCATIONS.map((loc) => (
              <Picker.Item key={loc} label={loc} value={loc} color="#0f172a" />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <IonicIcon name="save-outline" size={18} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Salvar Registro</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#0b1329",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 16,
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
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
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
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  picker: {
    flex: 1,
    height: 52,
    color: "#f8fafc",
    backgroundColor: "transparent",
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#10b981",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});