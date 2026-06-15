import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  StatusBar,
} from "react-native";
import IonicIcon from "@expo/vector-icons/Ionicons";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useApp } from "../../context/AppContext";

export default function Dashboard() {
  const { weatherLogs, currentUser } = useApp();

  // Calculations for current, min, max, average weather stats
  const stats = useMemo(() => {
    if (!weatherLogs || weatherLogs.length === 0) {
      return {
        currentTemp: 0,
        currentHumidity: 0,
        currentPressure: 0,
        currentCondition: "Desconhecido",
        maxTemp: 0,
        minTemp: 0,
        avgHumidity: 0,
      };
    }

    const latest = weatherLogs[0];
    const temps = weatherLogs.map((log) => log.temperature);
    const humidities = weatherLogs.map((log) => log.humidity);

    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const avgHumidity = Math.round(
      humidities.reduce((acc, curr) => acc + curr, 0) / humidities.length
    );

    return {
      currentTemp: latest.temperature,
      currentHumidity: latest.humidity,
      currentPressure: latest.pressure,
      currentCondition: latest.condition,
      maxTemp,
      minTemp,
      avgHumidity,
    };
  }, [weatherLogs]);

  // Prep data for react-native-chart-kit LineChart
  const chartData = useMemo(() => {
    if (!weatherLogs || weatherLogs.length === 0) {
      return { labels: ["-"], datasets: [{ data: [0] }] };
    }
    // Take latest 6 logs for the chart and reverse to show chronologically
    const sliceLogs = [...weatherLogs].slice(0, 6).reverse();
    return {
      labels: sliceLogs.map((log) => log.timestamp.split(" - ")[1] || log.timestamp),
      datasets: [
        {
          data: sliceLogs.map((log) => log.temperature),
          strokeWidth: 2,
        },
      ],
    };
  }, [weatherLogs]);

  // Prep data for PieChart – weather condition distribution
  const pieData = useMemo(() => {
    if (!weatherLogs || weatherLogs.length === 0) return [];
    const counts = {};
    weatherLogs.forEach((log) => {
      const cond = log.condition || "Desconhecido";
      counts[cond] = (counts[cond] || 0) + 1;
    });
    const colors = ["#f59e0b", "#38bdf8", "#f43f5e", "#a78bfa", "#10b981", "#fb923c"];
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      population: count,
      color: colors[idx % colors.length],
      legendFontColor: "#f8fafc",
      legendFontSize: 13,
    }));
  }, [weatherLogs]);

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case "ensolarado":
        return "sunny";
      case "chuvoso":
        return "rainy";
      case "nublado":
        return "cloudy";
      case "tempestade":
        return "thunderstorm";
      case "névoa":
        return "cloudy-night";
      default:
        return "partly-sunny";
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#0b1329" />

      {/* Header Info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Estação Ativa</Text>
          <Text style={styles.subGreeting}>
            Operador: {currentUser ? currentUser.name : "Visitante"}
          </Text>
        </View>
        <IonicIcon name="pulse" size={24} color="#10b981" />
      </View>

      {/* Hero Temperature Stats Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.currentConditionText}>{stats.currentCondition}</Text>
          <Text style={styles.heroTemperature}>{stats.currentTemp}°C</Text>
          <Text style={styles.locationText}>Estação Central - S/A</Text>
        </View>
        <IonicIcon name={getWeatherIcon(stats.currentCondition)} size={90} color="#f59e0b" style={styles.heroIcon} />
      </View>

      {/* Extreme statistics Grid (Max/Min) */}
      <View style={styles.grid}>
        <View style={[styles.gridCard, styles.cardHot]}>
          <IonicIcon name="arrow-up" size={24} color="#f43f5e" />
          <Text style={styles.gridLabel}>Máxima Registrada</Text>
          <Text style={styles.gridValue}>{stats.maxTemp}°C</Text>
        </View>
        <View style={[styles.gridCard, styles.cardCold]}>
          <IonicIcon name="arrow-down" size={24} color="#06b6d4" />
          <Text style={styles.gridLabel}>Mínima Registrada</Text>
          <Text style={styles.gridValue}>{stats.minTemp}°C</Text>
        </View>
      </View>

      {/* Secondary weather metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <IonicIcon name="water" size={18} color="#38bdf8" />
          <Text style={styles.metricLabel}>Umidade Atual: {stats.currentHumidity}%</Text>
        </View>
        <View style={styles.metricItem}>
          <IonicIcon name="speedometer" size={18} color="#a78bfa" />
          <Text style={styles.metricLabel}>Pressão: {stats.currentPressure} hPa</Text>
        </View>
      </View>

      {/* Temperature Trend Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tendência de Temperatura (Últimas Leituras)</Text>
        {weatherLogs && weatherLogs.length > 0 ? (
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 48}
            height={220}
            chartConfig={{
              backgroundColor: "#1e293b",
              backgroundGradientFrom: "#1e293b",
              backgroundGradientTo: "#0f172a",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#38bdf8",
              },
            }}
            bezier
            style={styles.chartStyle}
          />
        ) : (
          <Text style={styles.noData}>Nenhum registro para exibir gráfico.</Text>
        )}
      </View>

      {/* Weather Condition Distribution Pie Chart */}
      {pieData.length > 0 && (
        <View style={styles.pieContainer}>
          <Text style={styles.chartTitle}>Distribuição por Condição Climática</Text>
          <PieChart
            data={pieData}
            width={Dimensions.get("window").width - 48}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1329",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f8fafc",
  },
  subGreeting: {
    fontSize: 14,
    color: "#94a3b8",
  },
  heroCard: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 20,
  },
  heroLeft: {
    flex: 1,
  },
  currentConditionText: {
    fontSize: 16,
    color: "#38bdf8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTemperature: {
    fontSize: 52,
    fontWeight: "800",
    color: "#f8fafc",
    marginVertical: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#64748b",
  },
  heroIcon: {
    marginLeft: 16,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridCard: {
    flex: 0.48,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardHot: {
    backgroundColor: "rgba(244, 63, 94, 0.08)",
    borderColor: "rgba(244, 63, 94, 0.25)",
  },
  cardCold: {
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    borderColor: "rgba(6, 182, 212, 0.25)",
  },
  gridLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f8fafc",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricLabel: {
    marginLeft: 8,
    color: "#f8fafc",
    fontSize: 13,
  },
  chartContainer: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 16,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pieContainer: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginTop: 20,
  },
  noData: {
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 20,
  },
});
