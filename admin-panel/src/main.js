import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";

import axios from "axios";

// Use environment variable for backend URL with fallback
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "https://chust-express-backend.onrender.com";

createApp(App).use(router).mount("#app");
