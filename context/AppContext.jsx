import React, { createContext, useState, useContext, useEffect } from "react";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Simple cross-platform storage adapter
const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore on web if localStorage fails
    }
  },
  async remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};

const DEFAULT_USERS = [
  { email: "admin@weather.com", password: "123", name: "Estação Adm" },
];

const DEFAULT_LOGS = [
  { id: "1", temperature: 24.5, humidity: 65, pressure: 1012, condition: "Nublado", timestamp: "10/06 - 08:00", location: "Estação Central" },
  { id: "2", temperature: 27.8, humidity: 58, pressure: 1011, condition: "Ensolarado", timestamp: "10/06 - 12:00", location: "Estação Central" },
  { id: "3", temperature: 29.2, humidity: 52, pressure: 1009, condition: "Ensolarado", timestamp: "10/06 - 16:00", location: "Estação Central" },
  { id: "4", temperature: 23.1, humidity: 70, pressure: 1013, condition: "Chuvoso", timestamp: "10/06 - 20:00", location: "Estação Central" },
  { id: "5", temperature: 20.4, humidity: 82, pressure: 1014, condition: "Nublado", timestamp: "11/06 - 00:00", location: "Estação Central" },
  { id: "6", temperature: 18.9, humidity: 85, pressure: 1015, condition: "Névoa", timestamp: "11/06 - 04:00", location: "Estação Central" },
  { id: "7", temperature: 22.3, humidity: 72, pressure: 1014, condition: "Parcialmente Nublado", timestamp: "11/06 - 08:00", location: "Estação Central" },
];

export function AppProvider({ children }) {
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [weatherLogs, setWeatherLogs] = useState(DEFAULT_LOGS);
  const [loading, setLoading] = useState(true);

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.get("nimbus_app_data");
        if (saved) {
          if (saved.users) setUsers(saved.users);
          if (saved.weatherLogs) setWeatherLogs(saved.weatherLogs);
          if (saved.currentUser) setCurrentUser(saved.currentUser);
        }
      } catch (e) {
        console.warn("Could not load saved data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist everything
  const persistAll = async (updatedUsers, updatedLogs, user) => {
    await storage.set("nimbus_app_data", {
      users: updatedUsers,
      weatherLogs: updatedLogs,
      currentUser: user,
    });
  };

  const registerUser = (name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, message: "Preencha todos os campos." };
    }
    if (users.some((u) => u.email === email)) {
      return { success: false, message: "Este email já está cadastrado." };
    }
    const newUser = { name, email, password };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    persistAll(updatedUsers, weatherLogs, currentUser);
    return { success: true };
  };

  const loginUser = (email, password) => {
    if (!email || !password) {
      return { success: false, message: "Preencha todos os campos." };
    }
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      persistAll(users, weatherLogs, user);
      return { success: true };
    }
    return { success: false, message: "E-mail ou senha incorretos." };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    persistAll(users, weatherLogs, null);
  };

  const addWeatherLog = (log) => {
    const newLog = { id: Date.now().toString(), ...log };
    const updatedLogs = [newLog, ...weatherLogs];
    setWeatherLogs(updatedLogs);
    persistAll(users, updatedLogs, currentUser);
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        weatherLogs,
        loading,
        registerUser,
        loginUser,
        logoutUser,
        addWeatherLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}