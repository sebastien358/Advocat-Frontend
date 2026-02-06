import { defineStore } from 'pinia'
import type { BookingFormInterface } from '../shared/interfaces'
import {
  axiosBookingSlots,
  axiosCreateBooking,
} from '../shared/services/booking.service.ts'

export interface BookingDraft {
  categoryId: number | null
  serviceId: number | null
  staffId: number | null
  date: string | null
  datetime: string | null
}

export interface Slot {
  start: string
  end: string
  label: string
}

export interface BookingState {
  bookingDraft: BookingDraft
  slots: Slot[]
}

export const useBookingStore = defineStore('booking', {
  state: (): BookingState => ({
    bookingDraft: {
      categoryId: null,
      serviceId: null,
      staffId: null,
      date: null,
      datetime: null
    },
    slots: [],
  }),

  actions: {
    setBookingDraft(payload: Partial<BookingDraft>) {
      this.bookingDraft = {
        ...this.bookingDraft,
        ...payload
      }
    },
    resetBookingDraft() {
      this.bookingDraft = {
        categoryId: null,
        serviceId: null,
        staffId: null,
        date: null,
        datetime: null,
      }
      this.slots = []
    },
    async axiosSlots() {
      const { categoryId, serviceId, staffId, date } = this.bookingDraft

      if (!categoryId || !serviceId || !staffId || !date) {
        this.slots = []
        return
      }

      try {
        const response = await axiosBookingSlots(categoryId, serviceId, staffId, date)
        this.slots = response
      } catch(e) {
        console.error(e)
      }
    },
    async createBooking(dataBooking: BookingFormInterface) {
      return await axiosCreateBooking(dataBooking)
    }
  },

  persist: true
})

