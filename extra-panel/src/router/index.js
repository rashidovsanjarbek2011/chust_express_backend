import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import WorkersView from '../views/WorkersView.vue'
import VehiclesView from '../views/VehiclesView.vue'
import EquipmentsView from '../views/EquipmentsView.vue'
import TerritoriesView from '../views/TerritoriesView.vue'
import LoginView from '../views/LoginView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true }
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { path: 'workers', name: 'workers', component: WorkersView },
        { path: 'vehicles', name: 'vehicles', component: VehiclesView },
        { path: 'equipments', name: 'equipments', component: EquipmentsView },
        { path: 'rentals', name: 'rentals', component: () => import('../views/RentalsView.vue') },
        { path: 'territories', name: 'territories', component: TerritoriesView },
        { path: 'product/:id', name: 'product-detail', component: ProductDetailView },
        { path: 'activate', name: 'activate', component: () => import('../views/ActivateView.vue') },
        { path: 'guide', name: 'guide', component: () => import('../views/UsageGuideView.vue') },
        { path: 'policy', name: 'policy', component: () => import('../views/PrivacyPolicyView.vue') },
      ]
    }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  if (to.meta.requiresAuth) {
    if (!token || !user) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      next({ name: 'login' })
    } else if (user.role !== 'extra-user' && user.role !== 'user') {
      // Only allow Extra or regular users in this panel
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      next({ name: 'login' })
    } else {
      next()
    }
  } else if (to.meta.guest && token && (user?.role === 'extra-user' || user?.role === 'user')) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
