
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// -------------------- AXIOS GLOBAL SETUP --------------------
axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

// 🔑 ADD THIS: attach token automatically to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------------------------------

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loadingUser, setLoadingUser] = useState(true);

  // -------------------- FETCH USER --------------------
  const fetchUser = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get("/api/user/getData");

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
        setUser(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // -------------------- FETCH CHATS --------------------
  const fetchUsersChats = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get("/api/chat/get");

      if (data.success) {
        setChats(data.chats);

        if (data.chats.length === 0) {
          await createNewChat();
        } else {
          setSelectedChat(data.chats[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // -------------------- CREATE CHAT --------------------
  const createNewChat = async () => {
    if (!token || !user) {
      toast("Login to create a new chat");
      return;
    }

    try {
      navigate("/");
      await axios.get("/api/chat/create");
      await fetchUsersChats();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // -------------------- THEME EFFECT --------------------
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // -------------------- WHEN TOKEN CHANGES --------------------
  useEffect(() => {
    if (!token) {
      setUser(null);
      setChats([]);
      setSelectedChat(null);
      setLoadingUser(false);
      return;
    }

    fetchUser();
  }, [token]);

  // -------------------- WHEN USER CHANGES --------------------
  useEffect(() => {
    if (user) {
      fetchUsersChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUsersChats,
    token,
    setToken,
    setLoadingUser,
    axios,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
