import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import Login from "./views/Login.vue";
import Dashboard from "./views/Dashboard.vue";
import ExtraPanel from "./views/ExtraPanel.vue";
import "./style.css";

const routes = [
  { path: "/", name: "home", redirect: "/dashboard" },
  { path: "/login", name: "login", component: Login },
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, role: "manager" },
  },
  {
    path: "/extra-panel",
    name: "extra-panel",
    component: ExtraPanel,
    meta: { requiresAuth: true, role: "extra-user" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (to.meta.requiresAuth && !token) {
    next("/login");
    return;
  }

  if (to.meta.requiresAuth && to.meta.role && user.role !== to.meta.role) {
    // Redirect unauthorized users to a safe page
    next("/dashboard");
    return;
  }

  if (to.path === "/login" && token) {
    if (user.role === "manager") {
      next("/dashboard");
    } else if (user.role === "extra-user") {
      next("/extra-panel");
    } else {
      next("/login");
    }
    return;
  }

  next();
});

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

const app = createApp(App);
app.use(router);
app.mount("#app");
