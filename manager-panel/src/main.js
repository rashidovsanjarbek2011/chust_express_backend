import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import Login from "./views/Login.vue";
import Dashboard from "./views/Dashboard.vue";
import "./style.css";

const routes = [
  { path: "/", name: "home", redirect: "/dashboard" },
  { path: "/login", name: "login", component: Login },
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
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
  } else if (to.path === "/login" && token && user.role === "manager") {
    next("/dashboard");
  } else {
    next();
  }
});

import axios from "axios";

// Force backend URL
axios.defaults.baseURL = "https://chust-express-backend.onrender.com";

const app = createApp(App);
app.use(router);
app.mount("#app");
