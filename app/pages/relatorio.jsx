import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import IonicIcon from "@expo/vector-icons/Ionicons";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useApp } from "../../context/AppContext";

const ALL_CONDITIONS = [
  "Todas",
  "Ensolarado",
  "Parcialmente Nublado",
  "Nublado",
  "Chuvoso",
  "Tempestade",
  "Névoa",
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 48;

const chartConfig = {
  backgroundColor: "transparent",
  backgroundGradientFrom: "#1e293b",
  backgroundGradientTo: "#0f172a",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: "#38bdf8",
  },
  propsForBackgroundLines: {
    strokeDasharray: "4 4",
    stroke: "rgba(148, 163, 184, 0.15)",
  },
  propsForLabels: {
    fontSize: 10,
  },
};

const conditionColors = {
  Ensolarado: "#f59e0b",
  "Parcialmente Nublado": "#94a3b8",
  Nublado: "#64748b",
  Chuvoso: "#3b82f6",
  Tempestade: "#7c3aed",
  Névoa: "#a8a29e",
};

export default function Relatorio() {
  const { weatherLogs } = useApp();
  const [filter, setFilter] = useState("Todas");
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredLogs = useMemo(() => {
    let logs = [...weatherLogs];

    if (filter !== "Todas") {
      logs = logs.filter((log) => log.condition === filter);
    }

    if (sortOrder === "newest") {
      logs.sort((a, b) => {
        const [dayA, monthA, hourA] = a.timestamp.split(/[\/\s:-]+/);
        const [dayB, monthB, hourB] = b.timestamp.split(/[\/\s:-]+/);
        const dateA = new Date(2024, parseInt(monthA) - 1, parseInt(dayA), ...hourA.split(":"));
        const dateB = new Date(2024, parseInt(monthB) - 1, parseInt(dayB), ...hourB.split(":"));
        return dateB - dateA;
      });
    } else {
      logs.sort((a, b) => {
        const [dayA, monthA, hourA] = a.timestamp.split(/[\/\s:-]+/);
        const [dayB, monthB, hourB] = b.timestamp.split(/[\/\s:-]+/);
        const dateA = new Date(2024, parseInt(monthA) - 1, parseInt(dayA), ...hourA.split(":"));
        const dateB = new Date(2024, parseInt(monthB) - 1, parseInt(dayB), ...hourB.split(":"));
        return dateA - dateB;
      });
    }

    return logs;
  }, [weatherLogs, filter, sortOrder]);

  const stats = useMemo(() => {
    if (filteredLogs.length === 0) {
      return { avg: 0, max: 0, min: 0, count: 0, avgHum: 0, maxHum: 0, avgPres: 0 };
    }
    const temps = filteredLogs.map((l) => l.temperature);
    const hums = filteredLogs.map((l) => l.humidity);
    const pres = filteredLogs.map((l) => l.pressure);
    return {
      avg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      max: Math.max(...temps).toFixed(1),
      min: Math.min(...temps).toFixed(1),
      count: filteredLogs.length,
      avgHum: (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1),
      maxHum: Math.max(...hums).toFixed(1),
      avgPres: (pres.reduce((a, b) => a + b, 0) / pres.length).toFixed(1),
    };
  }, [filteredLogs]);

  // Temperature line chart (chronological order, last 12 entries)
  const tempChartData = useMemo(() => {
    const sorted = [...filteredLogs].sort((a, b) => {
      const [dayA, monthA, hourA] = a.timestamp.split(/[\/\s:-]+/);
      const [dayB, monthB, hourB] = b.timestamp.split(/[\/\s:-]+/);
      const dateA = new Date(2024, parseInt(monthA) - 1, parseInt(dayA), ...hourA.split(":"));
      const dateB = new Date(2024, parseInt(monthB) - 1, parseInt(dayB), ...hourB.split(":"));
      return dateA - dateB;
    });
    const slice = sorted.slice(-12);
    return {
      labels: slice.map((l) => l.timestamp.split(" - ")[1] || l.timestamp.split(" - ")[0]),
      datasets: [
        {
          data: slice.length > 0 ? slice.map((l) => l.temperature) : [0],
          color: (opacity = 1) => `rgba(244, 63, 94, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [filteredLogs]);

  // Humidity & Pressure line chart (dual axis style)
  const humPressChartData = useMemo(() => {
    const sorted = [...filteredLogs].sort((a, b) => {
      const [dayA, monthA, hourA] = a.timestamp.split(/[\/\s:-]+/);
      const [dayB, monthB, hourB] = b.timestamp.split(/[\/\s:-]+/);
      const dateA = new Date(2024, parseInt(monthA) - 1, parseInt(dayA), ...hourA.split(":"));
      const dateB = new Date(2024, parseInt(monthB) - 1, parseInt(dayB), ...hourB.split(":"));
      return dateA - dateB;
    });
    const slice = sorted.slice(-10);
    return {
      labels: slice.map((l) => l.timestamp.split(" - ")[1] || l.timestamp.split(" - ")[0]),
      datasets: [
        {
          data: slice.length > 0 ? slice.map((l) => l.humidity) : [0],
          color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: slice.length > 0 ? slice.map((l) => Math.round(l.pressure / 10)) : [0],
          color: (opacity = 1) => `rgba(167, 139, 250, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ["Umidade (%)", "Pressão (×10 hPa)"],
    };
  }, [filteredLogs]);

  // Condition distribution bar chart
  const conditionChartData = useMemo(() => {
    const counts = {};
    filteredLogs.forEach((l) => {
      counts[l.condition] = (counts[l.condition] || 0) + 1;
    });
    const conditions = Object.keys(counts);
    const values = Object.values(counts);
    return {
      labels: conditions.length > 0
        ? conditions.map((c) => (c.length > 8 ? c.substring(0, 6) + "…" : c))
        : ["Sem dados"],
      datasets: [
        {
          data: values.length > 0 ? values : [1],
        },
      ],
    };
  }, [filteredLogs]);

  const getConditionColor = (condition) => {
    return conditionColors[condition] || "#f8fafc";
  };

  const renderLogItem = ({ item }) => (
    <View style={styles.logRow}>
      <View style={styles.logLeft}>
        <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(item.condition) + "22" }]}>
          <Text style={[styles.conditionBadgeText, { color: getConditionColor(item.condition) }]}>
            {item.condition}
          </Text>
        </View>
        <Text style={styles.logTimestamp}>{item.timestamp}</Text>
        <Text style={styles.logLocation}>{item.location}</Text>
      </View>
      <View style={styles.logRight}>
        <Text style={styles.logTemp}>{item.temperature}°C</Text>
        <View style={styles.logMeta}>
          <IonicIcon name="water-outline" size={12} color="#38bdf8" />
          <Text style={styles.logMetaText}>{item.humidity}%</Text>
        </View>
        <View style={styles.logMeta}>
          <IonicIcon name="speedometer-outline" size={12} color="#a78bfa" />
          <Text style={styles.logMetaText}>{item.pressure} hPa</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b1329" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <IonicIcon name="stats-chart-outline" size={60} color="#38bdf8" />
          <Text style={styles.appTitle}>Relatório de Dados</Text>
          <Text style={styles.appSubtitle}>Visualize e analise os registros climáticos</Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.avg}°C</Text>
            <Text style={styles.statLabel}>Média</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#f43f5e" }]}>{stats.max}°C</Text>
            <Text style={styles.statLabel}>Máxima</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#06b6d4" }]}>{stats.min}°C</Text>
            <Text style={styles.statLabel}>Mínima</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#10b981" }]}>{stats.count}</Text>
            <Text style={styles.statLabel}>Registros</Text>
          </View>
        </View>

        {/* Secondary Stats Row */}
        <View style={styles.miniStatsRow}>
          <View style={styles.miniStatCard}>
            <IonicIcon name="water-outline" size={14} color="#38bdf8" />
            <Text style={styles.miniStatValue}>{stats.avgHum}%</Text>
            <Text style={styles.miniStatLabel}>Umidade Média</Text>
          </View>
          <View style={styles.miniStatCard}>
            <IonicIcon name="speedometer-outline" size={14} color="#a78bfa" />
            <Text style={styles.miniStatValue}>{stats.avgPres} hPa</Text>
            <Text style={styles.miniStatLabel}>Pressão Média</Text>
          </View>
          <View style={styles.miniStatCard}>
            <IonicIcon name="trending-up-outline" size={14} color="#f59e0b" />
            <Text style={styles.miniStatValue}>{stats.maxHum}%</Text>
            <Text style={styles.miniStatLabel}>Umidade Máx</Text>
          </View>
        </View>

        {/* Charts Section - updates dynamically when new data is registered */}
        {filteredLogs.length > 0 && (
          <>
            {/* Temperature Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <IonicIcon name="thermometer-outline" size={20} color="#f43f5e" />
                <Text style={styles.chartTitle}>Temperatura (°C)</Text>
              </View>
              {tempChartData.datasets[0].data.length > 1 ? (
                <LineChart
                  data={tempChartData}
                  width={CHART_WIDTH}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(244, 63, 94, ${opacity})`,
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: "#f43f5e",
                    },
                  }}
                  bezier
                  style={styles.chart}
                  withVerticalLines={false}
                  withDots={true}
                  fromZero={false}
                />
              ) : (
                <Text style={styles.chartPlaceholder}>
                  Adicione mais registros para visualizar a tendência de temperatura
                </Text>
              )}
            </View>

            {/* Humidity & Pressure Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <IonicIcon name="analytics-outline" size={20} color="#38bdf8" />
                <Text style={styles.chartTitle}>Umidade (%) e Pressão (×10 hPa)</Text>
              </View>
              {humPressChartData.datasets[0].data.length > 1 ? (
                <LineChart
                  data={humPressChartData}
                  width={CHART_WIDTH}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#38bdf8",
                    },
                  }}
                  bezier
                  style={styles.chart}
                  withVerticalLines={false}
                  withDots={true}
                  fromZero={false}
                />
              ) : (
                <Text style={styles.chartPlaceholder}>
                  Adicione mais registros para visualizar umidade e pressão
                </Text>
              )}
            </View>

            {/* Condition Distribution Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <IonicIcon name="pie-chart-outline" size={20} color="#f59e0b" />
                <Text style={styles.chartTitle}>Distribuição por Condição</Text>
              </View>
              {conditionChartData.datasets[0].data.length > 0 && (
                <BarChart
                  data={conditionChartData}
                  width={CHART_WIDTH}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                    barPercentage: 0.6,
                    propsForBackgroundLines: {
                      strokeDasharray: "4 4",
                      stroke: "rgba(148, 163, 184, 0.15)",
                    },
                    fillShadowGradientFrom: "#f59e0b",
                    fillShadowGradientTo: "#f59e0b",
                    fillShadowGradientFromOpacity: 0.6,
                    fillShadowGradientToOpacity: 0.1,
                  }}
                  style={styles.chart}
                  fromZero
                  showValuesOnTopOfBars
                  withInnerLines={true}
                />
              )}
            </View>
          </>
        )}

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Condição</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {ALL_CONDITIONS.map((cond) => (
                <TouchableOpacity
                  key={cond}
                  style={[styles.filterChip, filter === cond && styles.filterChipActive]}
                  onPress={() => setFilter(cond)}
                >
                  <Text style={[styles.filterChipText, filter === cond && styles.filterChipTextActive]}>
                    {cond}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={[styles.sortButton, sortOrder === "newest" && styles.sortButtonActive]}
              onPress={() => setSortOrder("newest")}
            >
              <IonicIcon name="arrow-down" size={14} color={sortOrder === "newest" ? "#0f172a" : "#94a3b8"} />
              <Text style={[styles.sortButtonText, sortOrder === "newest" && styles.sortButtonTextActive]}>
                Mais Recentes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortOrder === "oldest" && styles.sortButtonActive]}
              onPress={() => setSortOrder("oldest")}
            >
              <IonicIcon name="arrow-up" size={14} color={sortOrder === "oldest" ? "#0f172a" : "#94a3b8"} />
              <Text style={[styles.sortButtonText, sortOrder === "oldest" && styles.sortButtonTextActive]}>
                Mais Antigos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <IonicIcon name="cloud-offline-outline" size={60} color="#64748b" />
            <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
            <Text style={styles.emptySubtext}>
              {weatherLogs.length === 0
                ? "Adicione registros climáticos para visualizá-los aqui."
                : "Tente alterar o filtro selecionado."}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.listTitle}>
              {filteredLogs.length} registro{filteredLogs.length !== 1 ? "s" : ""} encontrado
              {filteredLogs.length !== 1 ? "s" : ""}
            </Text>
            <FlatList
              data={filteredLogs}
              renderItem={renderLogItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1329",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f8fafc",
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  miniStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    gap: 4,
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f8fafc",
  },
  miniStatLabel: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chartCard: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f8fafc",
  },
  chart: {
    borderRadius: 12,
  },
  chartPlaceholder: {
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 14,
  },
  filtersContainer: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  filterScroll: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  filterChipActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  filterChipText: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#0f172a",
    fontWeight: "700",
  },
  sortContainer: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sortButtonActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  sortButtonText: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 4,
    fontWeight: "500",
  },
  sortButtonTextActive: {
    color: "#0f172a",
    fontWeight: "700",
  },
  listTitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 12,
  },
  listContainer: {
    gap: 8,
  },
  logRow: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  logLeft: {
    flex: 1,
  },
  conditionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  conditionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  logTimestamp: {
    fontSize: 14,
    color: "#f8fafc",
    fontWeight: "600",
  },
  logLocation: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  logRight: {
    alignItems: "flex-end",
  },
  logTemp: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f8fafc",
  },
  logMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  logMetaText: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 40,
  },
});