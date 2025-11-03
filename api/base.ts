import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho request
api.interceptors.request.use(
  (config: import("axios").InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Interceptor cho response
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (error.response?.data.message === "Token đã hết hạn") {
      // Xóa token (nếu có)
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        // Redirect sang login
        window.location.href = "/login";
      }
    }
    console.error("API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;