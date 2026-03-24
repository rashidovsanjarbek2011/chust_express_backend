import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";

const app = createApp(App);
app.use(router);
app.use(i18n);

import axios from "axios";

// Set global base URL for axios
// If running in Electron (dist), use localhost:5000 (backend)
// If running in Browser (dev), use relative path (proxy)
const envUrl = import.meta.env.VITE_API_URL;
if (envUrl) {
  axios.defaults.baseURL = envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl;
} else {
  axios.defaults.baseURL = "https://chust-express-backend.onrender.com";
}

app.mount("#app");
