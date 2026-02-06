import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES_ADMIN } from '../features/admin/admin.routes.ts'
import { useAuthStore } from '../stores/authStore.ts'

const PrestationsView = () => import('@/features/advocat/PrestationsView.vue')
const ContactForm = () => import('@/features/advocat/components/contact/ContactForm.vue')
const BookingView = () => import('@/features/advocat/components/booking/BookingView.vue')
const BookingForm = () => import('@/features/advocat/components/booking/BookingForm.vue')
const BookingConfirmation = () => import('@/features/advocat/components/booking/BookingConfirmation.vue')
const TestimonialView = () => import('@/features/advocat/components/testimonials/TestimonialView.vue')
const Legal = () => import('../templates/mentions-legales/Legal.vue')
const Login = () => import('@/features/advocat/components/auth/Login.vue')
const RequestPassword = () => import('@/features/advocat/components/auth/reset-password/RequestPassword.vue')
const NotFound = () => import('../templates/notFound/NotFound.vue')
const Admin = () => import('../features/admin/Admin.vue')

const routes = [
  { path: '/', component: PrestationsView },
  { path: '/contact/form', component: ContactForm },
  { path: '/booking', component: BookingView },
  { path: '/booking/form', component: BookingForm },
  { path: '/confirmation', component: BookingConfirmation },
  { path: '/testimonials', component: TestimonialView },
  { path: '/legal-notices', component: Legal },
  { path: '/login', component: Login },
  { path: '/request-password', component: RequestPassword },
  {
    path: '/admin',
    component: Admin,
    meta: {
      hideHeader: true,
      hideFooter: true,
      requiresAuth: true,
      requiresAdmin: true
    },
    children: ROUTES_ADMIN
  },
  { path: '/:notFound(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 🔹 Cas 1 : navigation avec bouton retour / avant
    if (savedPosition) {
      return savedPosition
    }
    // 🔹 Cas 2 : navigation avec ancre (#services, #about, etc.)
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    // 🔹 Cas 3 : navigation classique
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({path: '/'})
  } else if (to.meta.requiresAdmin && !authStore.roleAdmin) {
    next({path: '/'})
  } else {
    next()
  }
})

export default router
