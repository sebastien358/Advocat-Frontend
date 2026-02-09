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
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
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

function selectDay(day: { value: string; label: string }) {
  bookingSelectedDate.value = day.value;

  bookingStore.setBookingDraft({
    ...bookingStore.bookingDraft,
    date: day.value,
    datetime: null,
  });

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

const isBookingIncomplete = computed(() => {
  return (
    !bookingCategoryId.value ||
    !bookingServiceId.value ||
    !bookingStaffId.value ||
    !bookingSelectedDate.value
  );
});

function selectSlot(slot: Slot) {
  bookingStore.setBookingDraft({
    ...bookingStore.bookingDraft,
    datetime: slot.start,
  });

  if (!isBookingIncomplete.value) {
    setTimeout(() => {
      router.push({ path: "/booking/form" });
    }, 300);
  }
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

  tl.from(bookingRef.value, {
    opacity: 0,
    duration: 1,
  });

  tl.from(
    logoRef.value,
    {
      opacity: 0,
      rotate: -90,
      transformOrigin: "50% 50%",
      duration: 0.6,
    },
    "-=0.3", // 👈 léger overlap = plus naturel
  );

  tl.from(
    staffLabel.value,
    {
      opacity: 0,
      x: -80,
      duration: 0.5,
    },
    "-=0.3", // 👈 léger overlap = plus naturel
  );
}

watch(loadingPage, async (isLoading) => {
  if (!isLoading) {
    await nextTick();
    animationOverlayPage();
  }
});


const progress = ref<number>(1)

const consultationType = ref<'Au cabinet' | 'En visio'>('Au cabinet')

watch([bookingCategoryId, bookingServiceId, bookingStaffId], () => {
    if (bookingCategoryId.value && bookingServiceId.value && bookingStaffId.value) {
      progress.value = 2
    } else {
      progress.value = 1
    }
  }, { immediate: true }
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
    <div class="container">
      <section v-if="isBookingIncomplete" class="booking" ref="bookingRef">
        <div class="booking__description">
          <p>Préparez votre rendez-vous<strong></strong></p>
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </div>
        <!-- Separator -->
        <div class="separator-top"></div>

        <div class="booking__title">
          <h1>JuriSlots</h1>
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
      <section v-else class="booking-reservation container-reservation">
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
          <h1>JuriSlots</h1>
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
    </div>
  </main>
</template>

<style scoped lang="scss">

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
}

/*=================
  CONTAINER
=================*/
.container {
  background: white;
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
  CONTAINER
=================*/

.container-reservation {
  margin: 0 auto;
  max-width: 1300px;
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
    padding: 0 12px 0 15px;
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
    color: red;
    width: 17px;
    height: 17px;
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
  }
  &__title h1 {
    font-size: 23px;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    text-transform: uppercase;
    font-weight: 600;
    color: #2A7B9B;
    letter-spacing: 0.2px;
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
    height: 100%;
    &__title {
      font-size: 19px;
    }
    &__subtitle {
      font-size: 13px;
    }
  }
}

@media (max-width: 767.98px) {
  .booking {

    &__title {
      font-size: 17px;
    }
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
    border: 1px solid #e0e0e0;
    background: white;
    color: #555;
    //padding: 6px 18px;
    padding: 15px 20px;

    font-size: 14px;
    white-space: nowrap;
  }
  .btn-category:hover {
    background: var(--blue-reservation);
    border: 1px solid var(--blue-border-reservation);
  }
  .btn-category.active {
    box-shadow: 0 4px 12px rgba(155, 92, 255, 0.12);
    background: var(--blue-reservation);
    border-color: var(--blue-border-reservation);
  }
}

@media (max-width: 1600px) {
  .booking-category {
    height: 100%;
  }
}

@media (max-width: 991.98px) {
  .booking-category {
   margin: 35px 0 0 0;
    gap: 10px;
    .btn-category {
      font-size: 13px;
    }
  }
}

@media (max-width: 767.98px) {
  .booking-category {
    margin: 30px 0 0 0;
    gap: 10px;
    .btn-category {
      font-size: 13px;
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
  margin: 16px auto 20px auto;
  cursor: pointer;

  padding: 0 15px;
  .service-label {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    padding: 12px 14px;
    border: 1px solid var(--border-soft);
    font-size: 13.5px;
    font-weight: 500;
    color: #4b4b4b;
    gap: 7px;
  }
  .service-label:hover {
    border-color: var(--blue-border-reservation);
    background: var(--blue-reservation);
  }
  .service-label .service-icon .fa-angle-down {
    width: 12.5px;
    height: auto;
  }
  .service-menu {
    background: white;
    width: 100%;
    position: absolute;
    border-right: 1px solid var(--blue-border-reservation);
    border-left: 1px solid var(--blue-border-reservation);
    border-bottom: 1px solid var(--blue-border-reservation);
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
        background: var(--blue-reservation);
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
    margin: 20px auto 20px auto;
    max-width: 450px;
    .service-label {
      font-size: 12px;
    }
    .service-menu {
      .service-items {
        gap: 13px;
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 576.98px) {
  .booking-service {
    max-width: 100%;
    .service-label {
      font-size: 12px;
    }
    .service-menu {
      padding: 10px 0;
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
  padding: 0 15px;
  .booking-staff.active-booking-staff {
    //margin: -5px auto 25px auto;
  }
  .booking-staff {
    margin: 0 auto 20px auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
        border: 2px solid #BFD6E2;
        border-radius: 50%;
        display: inline-block;
        position: relative;
        cursor: pointer;
        transition: 0.2s;
      }
      /* Effet quand sélectionné */
      input[type="radio"]:checked {
        border-color: #E5E7EB;
        background-color: #D7EAF2;
      }
      /* Petit point intérieur (optionnel pour encore plus premium) */
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
      padding: 9px 12px;
      border-radius: 12px;
      border: 1px solid var(--border-soft);
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
      flex-direction: row;
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

@media (max-width: 991.98px) {
  .booking-staff-wrapper {
    .booking-staff.active-booking-staff {
      margin: 5px auto 25px auto;
    }
    .booking-staff {
      &__grid {
        gap: 10px;
      }
      &__label p {
        font-size: 13px;
      }
      &__cards .name {
        font-size: 13px;
      }
      &__cards .name.one-card {
        font-size: 13px;
      }
      &__card__content {

        padding: 9px 12px;
      }
      &__card__content.one-card {
        //width: 340px;
        padding: 18px;
      }
      &__card__content__avatar img.one-card {
        width: 50px;
        height: 50px;
      }
    }
  }
}

@media (max-width: 767.98px) {
  .booking-staff-wrapper {
    .booking-staff.active-booking-staff {
      margin: 5px auto 25px auto;
    }
    .booking-staff {
      display: flex;
      justify-content: center;
      margin: 0 auto 15px auto;
      &__label {
        margin-bottom: 10px;
      }
      &__label p {
        font-size: 12px;
      }
      &__grid {
        flex-direction: column;
      }
      &__cards .name {
        font-size: 12px;
      }
      &__cards .name.one-card {
        font-size: 12px;
      }
      &__card__content {
        //max-width: 300px;
        padding: 8px 12px;
      }
      &__card__content.one-card {
        //width: 300px;
        padding: 16px;
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
    font-size: 14px;
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
    padding: 20px;
    border-radius: 10px;
    p {
      font-size: 12px;
      line-height: 21px;
    }
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

.container-reservation {
  margin: 0 auto;
  height: auto;
}

.booking-reservation {

  padding: 10px 0 15px 0;
  display: flex;
  flex-direction: column;
  &__summary {

    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    margin-top: 4px;
    font-size: 13px;
    color: #6b7280; // gris lisible, moderne
    text-align: center;
    letter-spacing: 0.2px;

    span {
      white-space: nowrap;
    }





    padding: 0 12px 0 15px;


  }
  &__summary .fa-xmark {
    cursor: pointer;
    color: red;
    width: 17px;
    height: 17px;
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
  }
  &__title h1 {
    font-size: 23px;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    text-transform: uppercase;
    font-weight: 600;
    color: #2A7B9B;
    letter-spacing: 0.2px;
  }





  .booking-reservation-title {
    margin-bottom: 20px;
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    color: #5a4e6a;
  }
  &__items {
    padding: 0 15px;
  }
  &__items .day-item {
    padding: 7px 12px;
    border-radius: 999px;
    background: #F3F4F6;
    border: 1px solid #E5E7EB;
    color: #6B7280;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    width: 150px;
    &:hover {
      background: #EEF1F5;
      border-color: #D1D5DB;
    }
  }
  &__items .day-item.active {
    background: #D7EAF2;          /* ton bleu */
    border: 1px solid #BFD6E2;    /* bleu un peu plus foncé */
    color: #1F2937;
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
      color: #b1a8e6;
      font-size: 20px;
      cursor: pointer;
      transition: color 0.2s ease, transform 0.2s ease;
    }
    .prev-day:hover {
      color: #5a46d6;
      transform: translateX(-2px);
    }
    .next-day:hover {
      color: #5a46d6;
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
    margin-top: 23px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
    animation: fadeIn 0.25s ease;
    .btn-reservation {
      font-size: 13px;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      color: #6B7280;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      border-radius: 6px;
      transition: all 120ms ease;
      &:hover {
        transform: translateY(-1px);
        background: #EEF1F5;
        border-color: #D1D5DB;
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

@media (max-width: 991.98px) {
  .booking-reservation {
    .booking-reservation-title {
      font-size: 1rem;
      margin-bottom: 25px;
    }
    &__items {
      .day-item {
        font-size: 13px;
      }
      .days-list .prev-day,
      .next-day {
        padding: 0;
      }
    }
    &__pagination {
      display: flex;
      align-items: center;
      .prev-day,
      .next-day {
        padding: 0 8px;
      }
    }
    &__slots {
      margin-top: 20px;
      .btn-reservation {
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 767.98px) {
  .container-reservation {
    padding: 30px 1rem;
  }

  .booking-reservation {
    .booking-reservation-title {
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    &__items {
      .days-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .day-item {
        width: 150px;
        font-size: 12px;
        padding: 8px 12px;
      }
    }
    &__pagination {
      display: flex;
      align-items: center;
      .prev-day,
      .next-day {
        padding: 0 20px;
        font-size: 22px;
      }
    }
    &__slots {
      margin-top: 18px;
      gap: 10px;
      .btn-reservation {
        font-size: 11px;
      }
    }
  }
}

@media (max-width: 575.98px) {
  .booking-reservation {
    &__items {
      .days-list {
        gap: 10px;
      }
      .day-item {
        width: 170px;
        font-size: 11px;
      }
    }
    &__slots {
      margin-top: 18px;
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
    border: 5px solid #716b6b;
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

/*=================
  BOOKING NO RÉSERVATION
=================*/

.booking {
  &__items {
    .days-list {
      gap: 10px;
    }
  }
  &__no__reservation {
    margin-top: 50px;
    p {
      color: #6b7280;
      font-size: 15px;
      text-align: center;
    }
  }
}

@media (max-width: 991.98px) {
  .booking {
    &__no__reservation {
      margin-top: 30px;
      p {
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 767.98px) {
  .booking {
    &__no__reservation {
      margin-top: 30px;
      p {
        font-size: 13px;
      }
    }
  }
}
</style>
