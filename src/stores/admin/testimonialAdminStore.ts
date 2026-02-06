import { defineStore } from 'pinia'
import type { TestimonialInterface } from '../../shared/interfaces'
import { axiosAdminTestimonialAdminList,
  axiosAdminTestimonialSearch, axiosTestimonialAdminCurrent, axiosTestimonialAdminDelete, axiosTestimonialAdminToggle
} from '../../shared/services/admin/testimonialAdmin.service.ts'

interface TestimonialState {
  testimonials: TestimonialInterface[]
  loading: boolean,
  isSearching: boolean
  searchTerm: string
  hasMore : boolean
  offset: number
  limit: number
}

export const useTestimonialAdminStore = defineStore('testimonialAdmin', {
  state: (): TestimonialState => ({
    testimonials: [] as any[],
    loading: true,
    isSearching: false,
    searchTerm: '',
    hasMore : true,
    offset: 0,
    limit: 3
  }),
  actions: {
    async testimonialList(append = false) {
      try {
        this.loading = true

        const response = await axiosAdminTestimonialAdminList(this.limit, this.offset)
        const testimonials = Array.isArray(response) ? response : []

        if (!append) {
          this.testimonials = testimonials
          this.offset = testimonials.length
        } else {
          this.testimonials.push(...testimonials)
          this.offset += testimonials.length
        }

        if (testimonials.length < this.limit) {
          this.hasMore = false
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    async testimonialSearch(term: string) {
      if (!term || term.trim().length === 0) {
        this.searchTerm = term
        this.isSearching = false
        this.offset = 0
        this.hasMore = true
        await this.testimonialList(false)
        return
      }

      if (term.trim().length < 2) return

      try {
        this.loading = true
        const response = await axiosAdminTestimonialSearch(term)
        this.testimonials = Array.isArray(response) ? response : []

        this.hasMore = false
      } catch (e) {
        console.error(e)
        this.testimonials = []
      } finally {
        this.loading = false
      }
    },
    async testimonialLazyLoad() {
      try {
        if (this.loading) return
        if (!this.hasMore) return
        if (this.isSearching) return

        await this.testimonialList(true)
      } catch(e) {
        console.error(e)
      }
    },
    async testimonialCurrent(id: number) {
      try {
        this.loading = true
        const response = await axiosTestimonialAdminCurrent(id)
        return response
      } catch (e) {
        console.error(e)
        return null
      } finally {
        this.loading = false
      }
    },
    async testimonialToggle(id: number) {
      try {
        return await axiosTestimonialAdminToggle(id)
      } catch(e) {
        console.error(e)
      }
    },
    async testimonialDelete(id: number, pictureId?: number) {
      try {
        return await axiosTestimonialAdminDelete(id, pictureId)
      } catch (e) {
        console.error(e)
      }
    },
    async resetTestimonialList() {
      try {
        this.isSearching = false
        this.searchTerm = ''
        this.offset = 0
        this.hasMore = true
        await this.testimonialList(false)
      } catch(e) {
        console.error(e)
      }
    }
  },
})

