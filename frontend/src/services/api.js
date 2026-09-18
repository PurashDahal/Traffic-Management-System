import axios from "axios";

export const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  let cleanPath = path;
  if (cleanPath.startsWith("/api/files/")) {
    cleanPath = cleanPath.substring("/api/files/".length());
  } else if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }

  // Encode each segment to handle spaces or special characters safely
  const encodedPath = cleanPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/api/files/${encodedPath}`;
};

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // When posting FormData, let Axios and browser compute multipart boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;
