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
let envUrl = import.meta.env.VITE_API_URL;
let baseURL = "http://localhost:5000";

if (envUrl) {
  baseURL = envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl;
}

// If baseURL is empty (VITE_API_URL was a relative path like "/api"),
// fallback to localhost:5000 for both Electron (file://) and browser dev mode.
if (baseURL === "") {
  baseURL = "http://localhost:5000";
}

axios.defaults.baseURL = baseURL;

app.mount("#app");

