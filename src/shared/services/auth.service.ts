import type { LoginFormInterface } from '../interfaces'
import axios from 'axios'
import { useAuthStore } from '../../stores/authStore.ts'
import router from '../../router'

const BASE_URL = import.meta.env.VITE_APP_API_URL as string

export async function axiosLogin(dataLogin: LoginFormInterface) {
  try {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      username: dataLogin.email,
      password: dataLogin.password,
    })
    if (response.status >= 200 && response.status < 300) {
      return response.data
    }
    throw new Error(`Erreur de la réservation : ${response.status}`)
  } catch (e) {
    console.error(e)
    throw e
  }
}

export async function axiosEmailExisting(email: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/user/existing`, {
      email
    });
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error(`Erreur l'email n'existe pas dans les données: ${response.status}`);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function axiosUserMe() {
  try {
    const response = await axios.get(`${BASE_URL}/api/user/me`)
    if (response.status >= 200 && response.status < 300) {
      return response.data
    }
    throw new Error(`Erreur de la récupération de l'utilisateur connecté : ${response.status}`)
  } catch (e) {
    console.error(e)
    throw e
  }
}

// REQUEST
axios.interceptors.request.use((config) => {
    const authStore = useAuthStore()
    const token = authStore.token

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// RESPONSE
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore()

    const hasAuthHeader = Boolean(
      error.config?.headers?.Authorization ||
      error.config?.headers?.authorization
    )

    if (error.response?.status === 401 && hasAuthHeader) {
      authStore.logout()
      router.push('/') // ✅ retour accueil, pas login
    }

    return Promise.reject(error)
  }
)
