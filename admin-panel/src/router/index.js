import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import ExtraPanel from "../components/ExtraPanel.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/extra-panel",
    name: "extra-panel",
    component: ExtraPanel,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token"); // ← "adminToken" o'rniga "token"
  const userStr = localStorage.getItem("user"); // ← "adminUser" o'rniga "user"

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!token || !userStr) {
      console.log("❌ No token or user data, redirecting to login");
      next("/login");
      return;
    }

    // Check if route requires admin role
    if (to.meta.requiresAdmin) {
      try {
        const user = JSON.parse(userStr);
        
        if (user.role !== "administrator") {
          console.log("❌ User is not administrator, redirecting to login");
          localStorage.clear(); // Clear non-admin session
          next("/login");
          return;
        }
        
        console.log("✅ Admin user authenticated, allowing access");
      } catch (e) {
        console.error("❌ Error parsing user data:", e);
        localStorage.clear();
        next("/login");
        return;
      }
    }
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (to.path === "/login" && token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role === "administrator") {
        console.log("✅ Already logged in as admin, redirecting to dashboard");
        next("/dashboard");
        return;
      }
    } catch (e) {
      localStorage.clear();
    }
  }

  next();
});

export default router;