<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { useBookingStore } from "@/stores/bookingStore.ts";
import ScrollTrigger from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import { useRouter } from "vue-router";

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

const router = useRouter();

onMounted(() => {
  setTimeout(async () => {
    bookingStore.resetBookingDraft();
    bookingStore.slots = [];
    await router.push("/");
  }, 4000);
});

/*===============
  ANIMATION CONFIRMATION
===============*/

const bookingRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  await nextTick();
  gsap.from(bookingRef.value, {
    opacity: 0,
    filter: "blur(6px)",
    duration: 0.8,
    ease: "power2.out",
  });
});
</script>

<template>
  <div class="booking container" ref="bookingRef">
    <!-- Booking text -->
    <div class="booking__title">
      <h1>Votre rendez-vous est confirmé</h1>
    </div>
    <!-- Booking date -->
    <div class="booking__date">
      <p class="date">📅 {{ formattedDate }}</p>
    </div>
    <!-- Booking icon -->
    <div class="booking__icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path d="M6 13c2-2 4-2 6 0s4 2 6 0" stroke="currentColor" stroke-width="2" fill="none" />
      </svg>
    </div>
    <!-- Booking text -->
    <div class="booking__text">
      <p>Un email de confirmation vous a été envoyé.</p>
      <p>À très bientôt au salon.</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
/*===============
  CONTAINER
===============*/

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/*===============
  BOOKING
===============*/

.booking {
  min-height: calc(100dvh - 100px);
  padding: 50px 2rem;
  &__title h1 {
    text-align: center;
    margin-bottom: 15px;
    color: #ad46ffff;
    font-family: "Playfair Display", serif;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  &__icon {
    text-align: center;
    font-size: 18px;
    opacity: 0.65;
    margin: 40px;
  }
  &__text {
    margin: 32px auto 0 auto;
    text-align: center;
    font-size: 15px;
    opacity: 0.5;
    line-height: 30px;
  }
  &__date {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 30px auto 0 auto;
    text-align: center;
    width: 100%;
    max-width: 310px;
    background: #f7f1ff;
    border: 1px solid #e1ccff;
    color: #6f4ccf;
    padding: 12px 14px;
    border-radius: 8px;
    font-weight: 500;
    gap: 15px;
  }
  &__date .date {
    border-radius: 999px;
    display: inline-block;
    font-size: 13px;
  }
}

@media (max-width: 991.98px) {
  .booking {
    padding: 40px 1.2rem;
    &__title h1 {
      font-size: 19px;
    }
    &__icon {
      margin: 30px 0 30px 0;
    }
    &__text {
      line-height: 26px;
      font-size: 14px;
    }
    &__date {
      width: 240px;
      .date {
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 767.98px) {
  .booking {
    padding: 30px 1.2rem;
    &__title h1 {
      font-size: 17px;
    }
    &__icon {
      margin: 30px 0 20px 0;
    }
    &__text {
      line-height: 22px;
      font-size: 13px;
    }
    &__date {
      width: 240px;
      .date {
        font-size: 11px;
      }
    }
  }
}
</style>
