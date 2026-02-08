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
  //setTimeout(async () => {
    //bookingStore.resetBookingDraft();
    //bookingStore.slots = [];
    //await router.push("/");
  //}, 4000);
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
  <div class="container">
  <div class="booking" ref="bookingRef">

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
    <div class="booking_text">
      <p class="booking_text--main">
        Votre rendez-vous est bien enregistré.
      </p>
      <p class="booking_text--secondary">
        Vous recevrez prochainement une confirmation par email.
      </p>
      <p class="booking_text--hint">
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

.container {
  height: 100vh;
  background: linear-gradient(
      180deg,
      #d2d6cf 0%,   /* très légèrement plus foncé */
      #e6e8e2 35%,
      #f7f8f6 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  @media (max-width: 991.98px) {
    padding: 150px 10px 60px 10px;
    height: 100%;
  }
  @media (max-width: 767.98px) {
    padding: 110px 10px 40px 10px;
    height: 100%;
  }
}

/*===============
  BOOKING
===============*/

.booking {
  padding: 30px 0;
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 20px;
  &__title h1 {
    text-align: center;
    margin-bottom: 15px;
    color: #1F2937;
    font-family: "Playfair Display", serif;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  &__icon {
    text-align: center;
    font-size: 18px;
    opacity: 0.65;
    margin: 30px 0 20px 0;
  }
  .booking_text {
    text-align: center;
    margin-top: 8px;
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

@media (max-width: 991.98px) {
  .booking {
    padding: 30px 1.2rem;
    &__title h1 {
      margin-bottom: 10px;
      font-size: 19px;
    }
    &__icon {
      font-size: 18px;
      margin: 30px 0;
    }
    &__text {
      line-height: 24px;
      font-size: 14px;
    }
  }
}

@media (max-width: 767.98px) {
  .booking {
    padding: 20px 1.2rem;
    &__title h1 {
      margin-bottom: 15px;
      font-size: 17px;
    }
    &__icon {
      margin: 20px 0 10px 0;
    }
    &__text {
      line-height: 22px;
      font-size: 13px;
    }
  }
}

/*===============
  BOOKING DATE
===============*/

.booking__date {
  margin: 20px auto 0 auto;
  text-align: center;
  width: 240px;
  padding: 11px;
  border-radius: 8px;
  font-weight: 500;
  gap: 6px;
  background: #D7EAF2;
  border: 1px solid #BFD6E2;
  color: #1F2937;
  .date {
    border-radius: 999px;
    display: inline-block;
    font-size: 13px;
  }
}

@media (max-width: 991.98px) {
  .booking__date {
    gap: 0;
    width: 240px;
    .date {
      font-size: 12px;
    }
  }
}

@media (max-width: 767.98px) {
  .booking__date {
    margin: 10px auto 0 auto;
    gap: 0;
    width: 240px;
    .date {
      font-size: 11px;
    }
  }
}
</style>
