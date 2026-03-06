export function getToken() {
  return localStorage.getItem("userToken");
}

export function logout() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("user");
}
export function getShopIdIfAllowed(user) {
  if (!user || typeof user !== "object") return 0;

  const allowedRoles = ["shop_worker", "shop_owner"];
  if (allowedRoles.includes(user.role)) {
    return user.shopId || 0;
  }
  return 0;
}
