import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";

import axios from "axios";

// Force backend URL to avoid proxy issues in different environments
axios.defaults.baseURL = "https://chust-express-backend.onrender.com";

createApp(App).use(router).mount("#app");
