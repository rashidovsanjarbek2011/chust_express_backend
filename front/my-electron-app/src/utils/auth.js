import axios from "axios";

export function getToken() {
  return (
    localStorage.getItem("userToken") || localStorage.getItem("token") || null
  );
}

export function logout() {
  // Clear every auth-related key. Some flows historically wrote "token"
  // alongside "userToken"; leaving either behind keeps the UI in a stale
  // "logged-in" state until the next hard refresh.
  localStorage.removeItem("userToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (
    axios.defaults &&
    axios.defaults.headers &&
    axios.defaults.headers.common
  ) {
    delete axios.defaults.headers.common["Authorization"];
  }
  // Let listeners (navbar, etc.) react immediately without a full reload.
  window.dispatchEvent(new Event("userLoggedOut"));
}
export function getShopIdIfAllowed(user) {
  if (!user || typeof user !== "object") return 0;

  const allowedRoles = ["shop_worker", "shop_owner"];
  if (allowedRoles.includes(user.role)) {
    return user.shopId || 0;
  }
  return 0;
}
