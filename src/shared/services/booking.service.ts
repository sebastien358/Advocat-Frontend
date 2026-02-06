import type { BookingFormInterface } from '../interfaces'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_APP_API_URL as string

export async function axiosBookingSlots(categoryId: number, serviceId: number, staffId: number, date: string,) {
  const response = await axios.get(`${BASE_URL}/api/appointment/slots`, {
    params: {
      categoryId,
      serviceId,
      staffId,
      date,
    },
  })

  return response.data
}

export async function axiosCreateBooking(dataBooking: BookingFormInterface) {
  try {
    const response = await axios.post(`${BASE_URL}/api/appointment/create`, dataBooking)
    if (response.status >= 200 && response.status < 300) {
      return response.data
   }
    throw new Error(`Erreur réservation : ${response.status}`)
  } catch(e) {
    console.error(e)
    throw e
  }
}
