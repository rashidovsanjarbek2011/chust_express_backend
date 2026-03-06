import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import foodDetail from "@/views/food-detail.vue";
import PathNotFound from "@/views/notFound.vue";
import addProduct from "@/views/addProduct.vue";
import OrderTracking from "@/views/OrderTracking.vue";
import MonitorPanel from "@/views/MonitorPanel.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      props: { searcher: "searchQuery" },
    },
    {
      path: "/createProduct",
      name: "create",
      component: addProduct,
      meta: { requiresAuth: true, roles: ["shop_owner", "shop_worker"] },
    },
    {
      path: "/food/:id",
      name: "food-detail",
      component: foodDetail,
      props: true,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not_found",
      component: PathNotFound,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/components/auth/login.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/components/auth/register.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/ProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/owner-dashboard",
      name: "owner-dashboard",
      component: () => import("@/views/OwnerDashboard.vue"),
      meta: { requiresAuth: true, roles: ["shop_owner"] },
    },
    {
      path: "/worker-dashboard",
      name: "worker-dashboard",
      component: () => import("@/views/WorkerDashboard.vue"),
      meta: { requiresAuth: true, roles: ["shop_worker"] },
    },
    {
      path: "/user-dashboard",
      name: "user-dashboard",
      component: () => import("@/views/UserDashboard.vue"),
      meta: { requiresAuth: true, roles: ["user"] },
    },
    {
      path: "/seller/sales",
      name: "seller-sales",
      component: () => import("@/views/SellerSales.vue"),
      meta: { requiresAuth: true, roles: ["shop_owner", "shop_worker"] },
    },
    {
      path: "/cart",
      name: "cart",
      component: () => import("@/views/CartView.vue"),
    },
    {
      path: "/order-tracking/:id",
      name: "order-tracking",
      component: OrderTracking,
      meta: { requiresAuth: true },
    },
    {
      path: "/delivery/lobby",
      name: "delivery-lobby",
      component: () => import("@/views/DeliveryLobby.vue"),
      meta: { requiresAuth: true, roles: ["delivery", "administrator"] },
    },
    {
      path: "/monitor-panel",
      name: "monitor-panel",
      component: () => import("@/views/MonitorPanel.vue"),
      meta: { requiresAuth: true, roles: ["administrator", "manager"] },
    },
    {
      path: "/delivery-order",
      name: "create-delivery",
      component: () => import("@/views/CreateDelivery.vue"),
      meta: { requiresAuth: true, roles: ["user", "shop_owner"] },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token =
    localStorage.getItem("userToken") || localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (to.meta.requiresAuth) {
    if (!token) {
      return next({ name: "login" });
    }

    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      // User is logged in but doesn't have permission
      // Redirect to their appropriate dashboard or home
      if (userRole === "shop_owner") return next({ name: "owner-dashboard" });
      if (userRole === "shop_worker") return next({ name: "worker-dashboard" });
      if (userRole === "delivery") return next({ name: "delivery-lobby" });
      if (userRole === "user") return next({ name: "user-dashboard" });
      if (userRole === "administrator") return next(); // Admin goes anywhere (usually)
      return next({ name: "home" });
    }
  }

  next();
});

export default router;
