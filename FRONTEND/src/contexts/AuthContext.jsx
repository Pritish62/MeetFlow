import { createContext, useState, useEffect } from "react";
import axios from "axios";

const defaultAuthContextValue = {
    userData: null,
    setUserData: () => { },
    token: null,
    handleRegister: async () => {
        throw new Error("AuthProvider is not available");
    },
    handleLogin: async () => {
        throw new Error("AuthProvider is not available");
    },
    logout: () => { }
};

export const AuthContext = createContext(defaultAuthContextValue);

const client = axios.create({
    baseURL: "http://localhost:8000/users"
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(() => {
        try {
            const storedUser = localStorage.getItem("authUser");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    useEffect(() => {
        if (userData) {
            localStorage.setItem("authUser", JSON.stringify(userData));
        } else {
            localStorage.removeItem("authUser");
        }
    }, [userData]);

    const handleRegister = async (username, email, password) => {
        try {
            const request = await client.post("/register", {
                username,
                email,
                password
            });
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const handleLogin = async (email, password) => {
        try {
            const request = await client.post("/login", {
                email,
                password
            });
            if (request.status === 200 && request.data.token) {
                localStorage.setItem("token", request.data.token);
                setToken(request.data.token);
                setUserData({
                    username: request.data.username,
                    email: request.data.email
                });
                return request.data;
            }
            throw new Error(request.data.message || "Failed to login");
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
        setToken(null);
        setUserData(null);
    };

    const data = {
        userData,
        setUserData,
        token,
        handleRegister,
        handleLogin,
        logout
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};