<script setup lang="ts">
import { useStaffStore } from "@/stores/staffStore.ts";
import { useCategoryStore } from "@/stores/categoryStore.ts";
import { useServiceStore } from "@/stores/serviceStore.ts";
import { useBookingStore } from "@/stores/bookingStore.ts";
import { computed, onMounted, ref, watch, nextTick, type Slot } from "vue";
import Calc from "@/templates/calc/Calc.vue";
import { gsap } from "gsap/gsap-core";
import { useRouter } from "vue-router";
import ProgressBooking from "@/templates/progress-bar/ProgressBooking.vue";
import BookingForm from "@/features/advocat/components/booking/BookingForm.vue";

const bookingServiceId = ref<number | null>(null);
const bookingServiceText = ref<string | null>(null);
const bookingServiceDuration = ref<string | null>(null);
const errorService = ref<string | null>(null);

const router = useRouter();

/*===============
  BOOKING STAFF
===============*/

const staffStore = useStaffStore();

const bookingStaffId = ref<number | null>(null);
const bookingStaffText = ref<string | null>(null);
const errorStaff = ref<string | null>(null);

function selectStaff(id: number, name: string) {
  bookingStaffId.value = id;
  bookingStaffText.value = name
  errorStaff.value = null;
}

onMounted(async () => {
  await staffStore.staffList();
});

/*===============
  BOOKING CATEGORY
===============*/

const categoryStore = useCategoryStore();

const bookingCategoryId = ref<number | null>(null);
const errorCategory = ref<string | null>(null);

onMounted(async () => {
  await categoryStore.categoryList();
});

function selectCategory(id: number) {
  bookingCategoryId.value = id;
  errorCategory.value = null;
}

/*===============
  BOOKING SERVICES
===============*/

const serviceStore = useServiceStore();

onMounted(async () => {
  await serviceStore.serviceList();
});

function selectService(id: number, duration: string, name: string) {
  bookingServiceId.value = id;
  bookingServiceText.value = name;
  bookingServiceDuration.value = duration;
  errorService.value = null;

  isOpen.value = false;
}

const filteredService = computed(() => {
  return serviceStore.services.filter((service) => service.category.id === bookingCategoryId.value);
});

/*===============
  ANIMATIONS SERVICE GSAP
===============*/

const serviceMenu = ref<HTMLElement | null>(null);

const isOpen = ref<boolean>(false);
const isVisible = ref<boolean>(false);

watch(isOpen, async (newVal) => {
  if (newVal && bookingCategoryId.value) {
    isVisible.value = true;

    await nextTick();
    if (!serviceMenu.value) return;

    gsap.fromTo(
      serviceMenu.value,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
    );
  } else {
    if (!serviceMenu.value) return;

    gsap.to(serviceMenu.value, {
      opacity: 0,
      y: -10,
      duration: 0.5,
      ease: "power3.out",
      onComplete: () => {
        isVisible.value = false;
      },
    });
  }
});

/*===============
  BUTTON TOGGLE
===============*/

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

/*====================================================
  AFFICHAGE DES CRÉNEAUX DE RÉSERVATION
  - Jours ouvrés uniquement (hors dimanche / lundi)
  - Initialisation automatique sur le prochain jour ouvert
  - Rechargement des créneaux selon :
    • la catégorie
    • la prestation
    • le membre du staff
    • la date sélectionnée
====================================================*/

// SOURCE DES JOURS
const availableDays = computed(() => {
  const days: { label: string; value: string }[] = [];
  const now = new Date();

  const isAfter19 = now.getHours() >= 18;
  const startOffset = isAfter19 ? 1 : 0;

  for (let i = startOffset; i < startOffset + 15; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    if (d.getDay() === 0) continue; // dimanche exclu

    days.push({
      label: d.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }).replace(/\./g, ""),
      value: d.toLocaleDateString("fr-CA"), // YYYY-MM-DD
    });

    if (days.length === 12) break;
  }

  return days;
});

// CARROUSEL

const pageSize = 3
const carouselIndex = ref(0)

const maxIndex = computed(() => {
  return Math.max(0, Math.ceil(availableDays.value.length / pageSize) - 1)
})

const visibleDays = computed(() => {
  const start = carouselIndex.value * pageSize
  return availableDays.value.slice(start, start + pageSize)
})

const prevDays = () => {
  if (carouselIndex.value > 0) carouselIndex.value--
}

const nextDays = () => {
  if (carouselIndex.value < maxIndex.value) carouselIndex.value++
}

/*====================================================
  AFFICHAGE DES JOURS DISPONIBLES POUR LA RÉSERVATION
  - Génère les prochains jours ouvrés
  - Exclut le dimanche et le lundi
  - Limite l’affichage à 3 jours disponibles
  - Format date compatible backend (YYYY-MM-DD)
====================================================*/

const todayLocal = new Date();

const bookingSelectedDate = ref(todayLocal.toLocaleDateString("fr-CA"));

watch(
  availableDays,
  (days) => {
    if (days.length === 0) return;
    // si la date actuelle n'est pas dans les jours autorisés
    const isValid = days.some((d) => d.value === bookingSelectedDate.value);
    if (!isValid) {
      bookingSelectedDate.value = days[0].value;
    }
  },
  { immediate: true },
);

const bookingStore = useBookingStore();

const bookingSelectDay = ref<HTMLElement | string>('')

function selectDay(day: { value: string; label: string }) {
  bookingSelectedDate.value = day.value;

  bookingStore.setBookingDraft({
    ...bookingStore.bookingDraft,
    date: day.value,
    datetime: null,
  });

  bookingSelectDay.value = day.value
  bookingStore.slots = [];
}

/*====================================================
  WATCHER DE RÉSERVATION
  Ce watcher :
  - écoute les dépendances clés de la réservation
  - déclenche un rechargement des créneaux dès qu’un
    paramètre change
  - garantit que les créneaux affichés sont toujours
    cohérents avec l’état courant
====================================================*/

const delay = async (ms: number) => {
  return new Promise((resolve, reject) => {
    if (ms < 0) {
      reject(new Error("Le chiffre doit etre positif"));
      return;
    }

    setTimeout(() => {
      resolve();
    }, ms);
  });
};

const loadingSlots = ref<boolean>(true);

watch([() => bookingCategoryId.value, () => bookingServiceId.value, () => bookingStaffId.value, () => bookingSelectedDate.value],
  async ([categoryId, serviceId, staffId, date]) => {
    loadingSlots.value = true;

    if (!categoryId || !serviceId || !staffId || !date) {
      loadingSlots.value = false;
      return;
    }

    bookingStore.setBookingDraft({
      categoryId,
      serviceId,
      staffId,
      date,
    });

    await Promise.all([bookingStore.axiosSlots(), delay(300)]);
    loadingSlots.value = false;
  },
  { immediate: true },
);


/*=================
  REDIRECTION DU FORMULAIRE
=================*/

const isStep1Complete = computed(() => {
  return (
    bookingCategoryId.value &&
    bookingServiceId.value &&
    bookingStaffId.value
  )
})

const isStep2Complete = computed(() => {
  return (
    bookingSelectedSlot.value &&
    bookingSelectedDate.value
  )
})

const bookingSelectedSlot = ref('')

function selectSlot(slot: Slot) {
  bookingStore.setBookingDraft({
    ...bookingStore.bookingDraft,
    datetime: slot.start,
  });

  bookingSelectedSlot.value = slot.start
}

// 1. loading réel (store)
const rawLoading = computed(
  () => categoryStore.loading || serviceStore.loading || staffStore.loading,
);

// 2. loading affiché (UI)
const loadingPage = ref<boolean>(true);

watch(rawLoading, (isLoading) => {
  if (isLoading) {
    loadingPage.value = true;
  } else {
    setTimeout(() => {
      loadingPage.value = false;
    }, 500);
  }
});

/*===============
  ANIMATION BOOKING PAGE
===============*/

const bookingRef = ref<HTMLElement | null>(null);
const logoRef = ref<HTMLElement | null>(null);
const staffLabel = ref<HTMLElement | null>(null);

function animationOverlayPage() {
  if (!bookingRef.value || !staffLabel.value) return;

  const tl = gsap.timeline({
    defaults: {
      ease: "power3.out",
    },
  });

  tl.from(logoRef.value, {
      opacity: 0,
      rotate: -90,
      duration: 0.6,
    }
  );

  tl.from(staffLabel.value, {
      opacity: 0,
      x: -80,
      duration: 0.5,
      delay: 0.3
    }
  );
}

watch(loadingPage, async (isLoading) => {
  if (!isLoading) {
    await nextTick();
    animationOverlayPage();
  }
});

const progress = ref<number>(1)

watch(
  [bookingCategoryId, bookingServiceId, bookingStaffId, bookingSelectedDate, bookingSelectedDate, bookingSelectedSlot],
  () => {
    if (
      bookingCategoryId.value &&
      bookingServiceId.value &&
      bookingStaffId.value &&
      bookingSelectedDate.value &&
      bookingSelectedSlot.value
    ) {
      progress.value = 3
    }
    else if (
      bookingCategoryId.value &&
      bookingServiceId.value &&
      bookingSelectedDate.value &&
      bookingStaffId.value
    ) {
      progress.value = 2
    }
    else {
      progress.value = 1
    }
  },
  { immediate: true }
)

watch(() => categoryStore.categories, (categories) => {
    if (categories.length && !bookingCategoryId.value) {
      bookingCategoryId.value = categories[0].id
    }
  },
  { immediate: true }
)
</script>

<template>
  <main class="page-wrapper">
    <div class="container" ref="bookingRef">
      <section v-if="!isStep1Complete" class="booking" >
        <div class="booking__description">
          <p>Préparez votre rendez-vous<strong></strong></p>
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </div>
        <!-- Separator -->
        <div class="separator-top"></div>
        <div class="booking__title">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8V44" stroke="currentColor" stroke-width="4"/>
            <path d="M16 16L6 32H26L16 16Z" fill="currentColor"/>
            <path d="M48 16L38 32H58L48 16Z" fill="currentColor"/>
            <rect x="20" y="44" width="24" height="6" fill="currentColor"/>
          </svg>
        </div>
        <!-- Barre de progression -->
        <ProgressBooking :progress="progress" />
        <!-- Booking category -->
        <section class="booking-category" v-if="categoryStore.categories.length > 0">
          <button
            v-for="cat in categoryStore.categories"
            :key="cat.id"
            @click="selectCategory(cat.id)"
            :class="{ active: bookingCategoryId === cat.id }"
            class="btn btn-category"
          >
            {{ cat.name }}
          </button>
        </section>
        <!-- Booking services -->
        <section class="booking-service" v-if="filteredService">
          <div>
            <div class="booking-service__description">
              <p class="booking-service__description-text"><span>📋</span>Type de consultation</p>
            </div>
            <div @click="toggleMenu()" class="service-label">
              {{ bookingServiceText || "Choisissez votre prestation" }}
              <span class="service-icon" ref="logoRef">
                <font-awesome-icon icon="fa-solid fa-angle-down" />
              </span>
            </div>
            <div class="service-menu" v-show="isVisible" ref="serviceMenu">
              <div
                @click="selectService(service.id, service.duration, service.name)"
                v-for="service in filteredService"
                :key="service.id"
                class="service-items"
                :class="{ 'active-service': service.id === bookingServiceId }"
              >
                <span class="name">{{ service.name }}</span>
                <span>{{ service.duration }} min</span>
                <span>{{ service.price }}€</span>
              </div>
            </div>
            <Calc :isVisible="isVisible" @close="isOpen = false" :transparent="true" />
          </div>
        </section>
        <!-- Booking staff -->
        <section class="booking-staff-wrapper" v-if="staffStore.filteredStaff.length > 0">
          <div class="booking-staff" ref="bookingStaff" :class="{ 'active-booking-staff': staffStore.filteredStaff.length > 0 }">
            <p class="booking-staff__label" ref="staffLabel" :class="{ active: staffStore.filteredStaff.length >= 2 }">
              Avec qui ?
            </p>
            <div class="booking-staff__grid">
              <label v-for="staff in staffStore.filteredStaff" :key="staff.id" class="booking-staff__cards">
                <!-- Accompagnant -->
                <div class="booking-staff__card__content" :class="{ 'one-card': staffStore.filteredStaff.length === 1 }">
                  <div class="booking-staff__card__content__avatar">
                    <img v-if="staff.picture" :src="staff.picture.filename" :class="{ 'one-card': staffStore.filteredStaff.length === 1 }" />
                    <span class="name" :class="{ 'one-card': staffStore.filteredStaff.length === 1 }">Maître {{ staff.firstname }}</span>
                  </div>
                  <input
                    @click="selectStaff(staff.id, staff.firstname)"
                    type="radio"
                    name="staff"
                    :value="staff.id"
                  />
                </div>
              </label>
            </div>
          </div>
        </section>
        <div class="booking__placeholder">
          <p>👤 Veuillez sélectionner un avocat pour afficher les disponibilités</p>
        </div>
      </section>
      <!-- BOOKING RESERVATION -->
      <section v-else-if="!isStep2Complete" class="booking-reservation container-reservation">
        <div class="booking-reservation__summary">
          <div class="booking-reservation__description">
            <span>{{ bookingServiceText }}</span>
            <span>• Maître {{ bookingStaffText }}</span>
            <span>• {{ bookingServiceDuration }} min</span>
          </div>
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </div>
        <!-- SEPARATOR -->
        <div class="separator-top"></div>
        <div class="booking-reservation__title">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8V44" stroke="currentColor" stroke-width="4"/>
            <path d="M16 16L6 32H26L16 16Z" fill="currentColor"/>
            <path d="M48 16L38 32H58L48 16Z" fill="currentColor"/>
            <rect x="20" y="44" width="24" height="6" fill="currentColor"/>
          </svg>
        </div>
        <!-- BARRE DE PROGRESSION -->
        <ProgressBooking :progress="progress" />
        <!-- CRÉNEAUX HORAIRES -->
        <h3 class="booking-reservation-title">Choisissez votre créneau 📅</h3>
        <div class="booking-reservation__items">
          <!-- JOURS TOUJOURS VISIBLES -->
          <div class="booking-reservation__pagination">
            <button @click="prevDays" :disabled="carouselIndex === 0" class="prev-day">‹</button>
            <div class="days-list">
              <button
                v-for="day in visibleDays"
                :key="day.value"
                class="day-item"
                :class="{ active: bookingSelectedDate === day.value }"
                @click="selectDay(day)"
              >
                {{ day.label }}
              </button>
            </div>
            <button @click="nextDays" :disabled="carouselIndex === maxIndex" class="next-day">›</button>
          </div>
          <!-- CRÉNEAUX -->
          <div v-if="loadingSlots" class="loading">
            <span class="loading__loader"></span>
          </div>
          <div v-else-if="bookingStore.slots.length > 0" class="booking-reservation__slots">
            <button
              v-for="slot in bookingStore.slots"
              :key="slot.start"
              class="btn btn-reservation"
              @click="selectSlot(slot)"
              :class="{ active: bookingStore.bookingDraft.datetime === slot.start }"
            >
              {{ slot.label }}
            </button>
          </div>
          <div v-else class="booking__no__reservation">
            <p>Aucun créneau disponible.</p>
          </div>
        </div>
      </section>

      <section v-else class="booking-form">
        <div class="booking-form__description">
          <p>Préparez votre rendez-vous<strong></strong></p>
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </div>
        <!-- Separator -->
        <div class="separator-top"></div>
        <div class="booking__title">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8V44" stroke="currentColor" stroke-width="4"/>
            <path d="M16 16L6 32H26L16 16Z" fill="currentColor"/>
            <path d="M48 16L38 32H58L48 16Z" fill="currentColor"/>
            <rect x="20" y="44" width="24" height="6" fill="currentColor"/>
          </svg>
        </div>
        <ProgressBooking :progress="progress" />
        <BookingForm />
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">


.booking-form {
  &__description {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0 0 0;
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

}















.page-wrapper {
  position: fixed;
  inset: 0;
  top: 0;
  left: 0;
  background: linear-gradient(
      180deg,
      #d2d6cf 0%,   /* très légèrement plus foncé */
      #e6e8e2 35%,
      #f7f8f6 100%
  );
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
  background: rgba(0, 0, 0, 0.43);



  padding: 0 10px;
}

/*=================
  CONTAINER
=================*/
.container {
  background: white;
  border-radius: 3px;
  padding: 0 15px;
  overflow: hidden;
  @media (max-width: 767.98px) {
    width: 100%;
  }
}

/*=================
  LOADING PAGE
=================*/

.loading-overlay {
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  &__loader {
    width: 40px;
    height: 40px;
    border: 5px solid var(--green-page);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 991.98px) {
  .loading-overlay {}
}

@media (max-width: 767.98px) {
  .loading-overlay {
    &__loader {
      width: 30px;
      height: 30px;
    }
  }
}

/*=================
  BOOKING
=================*/

.booking {
  padding: 20px 0 20px 0;
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
  &__subtitle {
    color: rgba(0, 0, 0, 0.55);
    font-size: 14px;
    letter-spacing: 0.2px;
    margin-top: 8px;
  }
}

@media (max-width: 991.98px) {
  .booking {
    &__subtitle {
      font-size: 13px;
    }
  }
}

@media (max-width: 767.98px) {
  .booking {
    &__subtitle {
      font-size: 12px;
      text-align: center;
    }
  }
}

/*===============
  BOOKING CATEGORY
===============*/

.booking-category {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  .btn-category {
    width: 100%;
    max-width: 160px;
    border-radius: 8px;
    font-weight: 500;
    transition: 0.2s ease;
    background: #f1f2f6;
    color: #555;
    padding: 15px 20px;
    font-size: 18px;
    white-space: nowrap;
  }
  .btn-category:hover {
    background: #08d8ea;
    color: white;
  }
  .btn-category.active {
    box-shadow: 0 4px 12px rgba(155, 92, 255, 0.12);
    background: #08d8ea;
    color: white;
  }
}

@media (max-width: 767.98px) {
  .booking-category {
    margin: 30px 0 0 0;
    gap: 10px;
    .btn-category {
      font-size: 16px;
    }
  }
}

/*===============
  BOOKING SERVICES
===============*/

.booking-service {
  z-index: 3;
  position: relative;
  max-width: 450px;
  margin: 22px auto 22px auto;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  &__description {
    margin-bottom: 10px;
    font-weight: 500;
  }
  &__description-text {
    display: flex;
    align-items: center;
    column-gap: 5px;
    font-size: 18px;
    letter-spacing: 0.3px;
  }
  &__description-text span {
    font-size: 15px;
  }
  .service-label {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    padding: 12px 14px;
    border: 1px solid #dfe4ea;
    font-weight: 500;
    color: #4b4b4b;
    gap: 7px;
    font-size: 17px;
    transition: 0.2s ease;
    width: 380px;
  }
  .service-label:hover {
    border-color: #08d8ea;
    color: white;
    background: #08d8ea;
  }
  .service-label .service-icon .fa-angle-down {
    width: 12.5px;
    height: auto;
  }
  .service-menu {
    background: white;
    width: 380px;
    position: absolute;
    border-right: 1px solid #dfe4ea;
    border-left: 1px solid #dfe4ea;
    border-bottom: 1px solid #dfe4ea;
    border-top: none;
    padding: 15px 8px;
    max-height: 270px;
    overflow-y: auto;
    .service-items {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      font-size: 13px;
      color: #47407a;
      padding: 8px;
      &:hover {
        background: #08d8ea;
      }
      .service-name {
        font-weight: 600;
      }
    }
    .service-items.active-service {
      background: var(--blue-reservation);
    }
  }
}

@media (max-width: 991.98px) {
  .booking-service {
    .service-menu {
      .service-items {
        gap: 13px;
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 767.98px) {
  .booking-service {
    display: block;
    &__description-text {
      justify-content: center;
    }
    .service-label {
      font-size: 16px;
      width: 100%;
    }
    .service-menu {
      padding: 10px 0;
      width: 100%;
      .service-items {
        gap: 10px;
        font-size: 11px;
      }
    }
  }
}

/*===============
  BOOKING STAFF
===============*/

.booking-staff-wrapper {
  display: flex;
  justify-content: center;
  .booking-staff.active-booking-staff {
    //margin: -5px auto 25px auto;
  }
  .booking-staff {
    margin: 0 auto 20px auto;
    &__grid {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    &__label {
      margin-bottom: 7px;
      display: none;
      text-align: left;
      position: relative;
      color: #a0a0a0;
      font-size: 13px;
      font-weight: 500;
      opacity: 0.85;
    }
    &__label.active {
      display: block;
      align-self: flex-start;
    }
    &__label::after {
      content: "";
      position: absolute;
      bottom: -6px;
      left: 0;
      height: 2px;
      width: 0;
      background-color: #a06bff;
      transition: width 0.25s ease;
    }
    &__cards {
      input[type="radio"] {
        appearance: none;
        width: 15px;
        height: 15px;
        border: 2px solid #dfe4ea;
        border-radius: 50%;
        display: inline-block;
        position: relative;
        cursor: pointer;
        transition: 0.2s;
      }
      /* Effet quand sélectionné */
      input[type="radio"]:checked {
        border-color: #08d8ea;
        background: #08d8ea;
      }
      input[type="radio"]:checked::after {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      }
      .name {
        color: #6f7a86;
        font-size: 12px;
      }
      .name.one-card {
        font-size: 15px;
        font-weight: 500;
        color: #6f7a86;
      }
    }
    &__card__content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 12px;
      border-radius: 12px;
      border: 1px solid #dfe4ea;
      background: white;
      width: 230px;
    }
    &__card__content.one-card {
      padding: 18px 20px;
      gap: 16px;
      width: 340px;
    }
    &__card__content__avatar {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    &__card__content__avatar img {
      border-radius: 50%;
      width: 48px;
      height: 48px;
      object-fit: cover;
    }
    &__card__content__avatar img.one-card {
      width: 72px;
      height: 72px;
    }
  }
}

@media (max-width: 767.98px) {
  .booking-staff-wrapper {
    .booking-staff.active-booking-staff {
      margin: 5px auto 25px auto;
    }

    .booking-staff {
      &__label {
        margin-bottom: 10px;
      }
      &__grid {
        flex-direction: column;
      }
      &__card__content {
        width: 250px;
      }
      &__card__content.one-card {
        width: 230px;
      }
      &__card__content__avatar img.one-card {
        width: 50px;
        height: 50px;
      }
    }
  }
}

/*===============
  BOOKING PLACEHOLDER
===============*/

.booking__placeholder {
  padding: 20px 10px;
  border-radius: 3px;
  width: auto;
  background: #F5F6F7;
  border: 1px solid #E5E7EB;
  color: #6B7280;
  margin: 0 15px;
  p {
    text-align: center;
    font-size: 15px;
  }
}

@media (max-width: 991.98px) {
  .booking__placeholder {
    p {
      font-size: 13px;
      line-height: 21px;
    }
  }
}

@media (max-width: 767.98px) {
  .booking__placeholder {
    display: none;
  }
}

/*===============
  BOOKING ICON
===============*/

.booking-icon {
  margin: 30px 0 45px 0;
  text-align: center;
  font-size: 22px;
  opacity: 0.5;
}

/*=================
  BOOKING RÉSERVATION
=================*/

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.booking-reservation {
  padding: 10px 0 30px 0;
  display: flex;
  flex-direction: column;
  &__summary {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 13px;
    color: #6b7280;
    text-align: center;
    letter-spacing: 0.2px;
    span {
      white-space: nowrap;
    }

  }
  &__summary .fa-xmark {
    cursor: pointer;
    width: 16px;
    height: 16px;
    color: black;
  }
  &__description {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    row-gap: 5px;
  }
  &__description p {
    font-family: "Playfair Display", serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.2px;
    color: #2F2F2F;
  }
  .separator-top {
    border-bottom: 1px solid #e0e0e0;
    padding-top: 20px;
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
      height: 26px;
      width: 26px;
      color: black;
    }
  }
  .booking-reservation-title {
    margin-top: -8px;
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    color: #5a4e6a;
  }
  &__items {
    padding: 0 15px;
  }
  &__items .day-item {
    padding: 16px 0;
    border-radius: 15px;
    outline: none;
    border: 1px solid #E5E7EB;
    color: #6B7280;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    width: 110px;
    &:hover {
      background: #08d8ea;
      font-weight: 500;
      color: white;
      border-color: #08d8ea;
    }
  }
  &__items .day-item.active {
    background: #08d8ea;
    font-weight: 500;
    color: white;
    border-color: #08d8ea;
  }
  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    .prev-day,
    .next-day {
      background: transparent;
      border: none;
      padding: 0 10px;
      color: black;
      font-size: 26px;
      cursor: pointer;
      transition: color 0.2s ease, transform 0.2s ease;
    }
    .prev-day:hover {
      color: #08d8ea;
      transform: translateX(-2px);
    }
    .next-day:hover {
      color: #08d8ea;
      transform: translateX(2px);
    }
    .days-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
  &__slots {
    margin: 19px 40px 0 40px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 10px;
    animation: fadeIn 0.25s ease;
    .btn-reservation {
      font-size: 13px;
      border: 1px solid #E5E7EB;
      color: #6B7280;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      border-radius: 6px;
      transition: all 120ms ease;
      background: #f1f2f6;
      padding: 12px 0;
      &:hover {
        background: #D7EAF2;
        border: 1px solid #BFD6E2;
        color: #1F2937;

      }
    }
    .btn-reservation.active {
      background: #D7EAF2;
      border: 1px solid #BFD6E2;
      color: #1F2937;

    }
    .btn-reservation:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

.booking__no__reservation {
  margin-top: 20px;
  text-align: center;
  p {
    font-size: 15px;
  }
}


@media (max-width: 991.98px) {
  .booking-reservation {
    .booking-reservation-title {

      display: none;
    }
    &__items {
      .day-item {
        font-size: 13px;
        padding: 10px 0;
      }
    }
    &__pagination {
      display: flex;
      align-items: center;
    }
    &__slots {
      .btn-reservation {
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 767.98px) {
  .container-reservation {
    padding: 20px 0;
  }

  .booking-reservation {
    &__items {
      .days-list {
        gap: 8px;
      }
      .day-item {
        font-size: 13px;
      }
    }
    &__pagination {
      display: flex;
      align-items: center;
      .prev-day,
      .next-day {
        padding: 0 20px;
      }
    }
    &__slots {
      margin-top: 18px;
      gap: 8px;
      .btn-reservation {
        font-size: 12px;

        padding: 10px 0;
      }
    }
  }
}

@media (max-width: 575.98px) {
  .booking-reservation {
    .booking-reservation-title {

    }
    &__items {
      .days-list {
        gap: 10px;
      }
      .day-item {
        width: 140px;
        font-size: 13px;
      }
    }
    &__slots {
      margin: 18px 0 0 0;

    }
    &__pagination {
      .prev-day,
      .next-day {
        font-size: 24px;
      }
    }
  }
}











/*=================
  LOADING SLOT
=================*/

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  &__loader {
    width: 30px;
    height: 30px;
    border: 5px solid #08d8ea;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 991.98px) {
  .loading {
    height: 150px;
  }
}

@media (max-width: 767.98px) {
  .loading {
    height: 100px;
  }
}

</style>
