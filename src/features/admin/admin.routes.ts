import type { RouteRecordRaw } from 'vue-router'

const BookingList = () => import('./views/booking/BookingList.vue')
const BookingDetails = () => import('./views/booking/BookingDetails.vue')
const TestimonialList = () => import('./views/testimonial/TestimonialAdminList.vue')
const TestimonialDetails = () => import('./views/testimonial/TestimonialDetails.vue')
const ContactList = () => import('./views/contact/ContactList.vue')
const ContactDetails = () => import('./views/contact/ContactDetails.vue')
const ServiceList = () => import('./views/service/ServiceList.vue')
const ServiceDetails = () => import('./views/service/ServiceDetails.vue')
const ServiceForm = () => import('./views/service/ServiceForm.vue')
const StaffList = () => import('./views/staff/StaffList.vue')
const StaffDetails = () => import('./views/staff/StaffDetails.vue')
const StaffForm = () => import('./views/staff/StaffForm.vue')


export const ROUTES_ADMIN: RouteRecordRaw[] = [
  { path: '', redirect: '/booking/list' },
  { path: '/booking/list', name: 'booking-list', component: BookingList },
  { path: '/booking/details/:id', name: 'booking-details', component: BookingDetails },
  { path: '/testimonial/list', name: 'testimonial-list', component: TestimonialList },
  { path: '/testimonial/details/:id', name: 'testimonial-details', component: TestimonialDetails },
  { path: '/contact/list', name: 'contact-list', component: ContactList },
  { path: '/contact/details/:id', name: 'contact-details', component: ContactDetails },
  { path: '/service/list', name: 'service-list', component: ServiceList },
  { path: '/service/details/:id', name: 'service-details', component: ServiceDetails },
  { path: '/service/form', name: 'service-form', component: ServiceForm },
  { path: '/staff/list', name: 'staff-list', component: StaffList },
  { path: '/staff/show/:id', name: 'staff-details', component: StaffDetails },
  { path: '/staff/form', name: 'staff-form', component: StaffForm },
]
