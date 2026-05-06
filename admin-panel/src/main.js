import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";

import axios from "axios";

// Environment-based API URL configuration
// Priority: 1. VITE_API_BASE_URL env var, 2. Production detection, 3. Localhost fallback
let baseURL = "http://localhost:5000";

const envUrl = import.meta.env.VITE_API_BASE_URL;

if (envUrl) {
  baseURL = envUrl;
} else if (import.meta.env.PROD) {
  // Production build without env var - use production backend
  baseURL = "https://chust-express-backend.onrender.com/api";
}

axios.defaults.baseURL = baseURL;

createApp(App).use(router).mount("#app");
