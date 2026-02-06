import { defineStore } from 'pinia'
import type { LoginFormInterface } from '../shared/interfaces'
import { axiosEmailExisting, axiosLogin, axiosUserMe } from "../shared/services/auth.service.ts";

interface authState {
  isLoggedIn: boolean,
  token: string | null,
  user: string | null,
  roles: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): authState => ({
    token: null,
    isLoggedIn: false,
    user: null,
    roles: null
  }),
  actions: {
    async login(dataLogin: LoginFormInterface) {
      try {
        const response = await axiosLogin(dataLogin)
        if (response?.token) {
          this.isLoggedIn = true
          this.token = response.token
          await this.me()
        }
        return response
      } catch(e) {
        console.error(e)
      }
    },
    async emailExisting(email: string) {
      try {
        return await axiosEmailExisting(email)
      } catch(e) {
        console.error(e)
      }
    },
    async me() {
      try {
        const response = await axiosUserMe()
        if (response.roles) {
          this.roles = response.roles
          return response
        }
      } catch(e) {
        console.error(e)
      }
    },
    roleAdmin() {
      return this.roles.includes('ROLE_ADMIN')
    },
    logout() {
      this.token = null
      this.isLoggedIn = false
      this.user = null
      this.roles = null
    }
  },

  persist: {
    key: 'auth',
    storage: localStorage,
    paths: ['token']
  }
})
