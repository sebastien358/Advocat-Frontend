
<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from "vue";
import { useBookingStore } from "@/stores/bookingStore.ts";
import ScrollTrigger from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import { useRouter } from "vue-router";
import {useUiStore} from "@/stores/uiStore.ts";

gsap.registerPlugin(ScrollTrigger);

/*===============
  BOOKING DATE
===============*/

const bookingStore = useBookingStore();

const dateBooking = ref<string | null>(null);

dateBooking.value = bookingStore.bookingDraft.datetime;

const formattedDate = computed(() => {
  const value = bookingStore.bookingDraft.datetime;

  if (!bookingStore.bookingDraft.datetime) return "";

  const date = new Date(value);

  return new Intl.DateTimeFormat("fr-Fr", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(date);
});

/*===============
  RESET DATA BOOKING
===============*/

const uiStore = useUiStore()
const router = useRouter()

onMounted(() => {
  const timeout = setTimeout(() => {
    uiStore.closeBooking()
    bookingStore.resetBookingDraft()
    router.replace('/')
  }, 3000)

  onUnmounted(() => {
    clearTimeout(timeout)
  })
})
</script>

<template>
  <div class="container-confirmation">
    <div class="booking">
      <!-- Booking date -->
      <div class="booking__date">
        <p class="date">📅 {{ formattedDate }}</p>
      </div>
      <!-- Booking text -->
      <div class="booking__text">
        <p class="booking__text--main">
          Votre rendez-vous est bien enregistré.
        </p>
        <p class="booking__text--secondary">
          Vous recevrez prochainement une confirmation par email.
        </p>
        <p class="booking__text--hint">
          Le cabinet vous contactera si des informations complémentaires sont nécessaires.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/*===============
  CONTAINER
===============*/

.container-confirmation {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/*===============
  BOOKING
===============*/

.booking {
  padding: 20px 0;
  background: white;
  border-radius: 20px;
  &__description {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__description p {
    font-family: "Playfair Display", serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.2px;
    color: #2F2F2F;
  }
  &__description .fa-xmark {
    cursor: pointer;
    width: 16px;
    height: 16px;
    font-weight: 900;
  }
  .separator-top {
    border-bottom: 1px solid #e0e0e0;
    padding-top: 20px;
  }
  &__title {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
      height: 27px;
      width: 27px;
      color: black;
    }
  }
  &__title h1 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 15px;
    color: #1F2937;
    font-family: "Playfair Display", serif;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  .booking__text {
    text-align: center;
    margin-top: 8px;
    @media (max-width: 767.98px) {
      margin-top: -3px;
    }
    &--main {
      font-size: 14px;
      font-weight: 500;
      color: #2f2f2f;
      margin-bottom: 6px;
    }
    &--secondary {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.55);
      margin-bottom: 8px;
    }
    &--hint {
      color: rgba(0, 0, 0, 0.4);
      line-height: 1.4;
      font-size: 11.5px;
      opacity: 0.6;
    }
  }
}

/*===============
  BOOKING DATE
===============*/

.booking__date {
  margin: 10px auto 30px auto;
  text-align: center;
  width: 240px;
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
  gap: 6px;
  background: #D7EAF2;
  border: 1px solid #BFD6E2;
  color: #1F2937;
  @media (max-width: 991.98px) {
    padding: 8px;
  }
  @media (max-width: 767.98px) {
    padding: 7px;
  }
  .date {
    font-size: 13px;
    @media (max-width: 991.98px) {
      font-size: 13px;
    }
    @media (max-width: 767.98px) {
      font-size: 12px;
    }
  }
}
</style>
