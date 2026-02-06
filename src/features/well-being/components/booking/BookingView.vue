<script setup lang="ts">
import { useStaffStore } from "@/stores/staffStore.ts";
import { useCategoryStore } from "@/stores/categoryStore.ts";
import { useServiceStore } from "@/stores/serviceStore.ts";
import { useBookingStore } from "@/stores/bookingStore.ts";
import { computed, onMounted, ref, watch, nextTick, type Slot } from "vue";
import Calc from "@/templates/calc/Calc.vue";
import { gsap } from "gsap/gsap-core";
import { useRouter } from "vue-router";

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
const errorStaff = ref<string | null>(null);

function selectStaff(id: number) {
  bookingStaffId.value = id;
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

function selectSlot(slot: Slot) {
  bookingStore.setBookingDraft({
    ...bookingStore.bookingDraft,
    datetime: slot.start,
  });

  setTimeout(() => {
    router.push({ path: "/booking/form" });
  }, 300);
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

/*=================
  AFFICHAGE DU FORMULAIRE
=================*/

const isBookingIncomplete = computed(() =>
    !bookingCategoryId.value ||
    !bookingServiceId.value ||
    !bookingStaffId.value,
  !bookingSelectedDate.value
);

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
</script>

<template>
  <main v-if="!loadingPage" class="page-wrapper">
    <div class="container">
      <div v-if="isBookingIncomplete" class="booking" ref="bookingRef">
        <div class="booking__description">
          <h1 class="booking__title">Préparez votre rendez-vous</h1>
          <p class="booking__subtitle">Choisissez votre prestation et votre praticien·ne</p>
        </div>
        <!-- Booking category -->
        <section class="booking-category" v-if="categoryStore.categories.length > 0">
          <button
            @click="selectCategory(cat.id)"
            v-for="cat in categoryStore.categories"
            :key="cat.id"
            :class="{ active: cat.id === bookingCategoryId }"
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
                    <span class="name" :class="{ 'one-card': staffStore.filteredStaff.length === 1 }">{{ staff.firstname }}</span>
                  </div>
                  <input
                    @click="selectStaff(staff.id)"
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
          <p>👤 Sélectionnez un·e praticien·ne afin de consulter les disponibilités</p>
        </div>
      </div>
      <!-- BOOKING RESERVATION -->
      <section v-else class="booking-reservation container-reservation">
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
  <main v-else class="loading-overlay">
    <span class="loading-overlay__loader"></span>
  </main>
</template>

<style scoped lang="scss">
/*=================
  LOADING PAGE
=================*/

.loading-overlay {
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 700px;
  padding-top: 160px;
  &__loader {
    width: 40px;
    height: 40px;
    border: 5px solid #b874ff;
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
  .loading-overlay {
    align-items: center;
    padding-top: 0;
    height: 100%;
  }
}

@media (max-width: 767.98px) {
  .loading-overlay {
    align-items: flex-start;
    padding-top: 100px;
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
  padding: 30px;
  margin: 0 auto;
  max-width: 1300px;
}

/*=================
  CONTAINER
=================*/

.container {
  margin: 0 auto;
  max-width: 1100px;
}

/*=================
  BOOKING
=================*/

.booking {
  padding: 40px 20px;
  &__description {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  &__title {
    font-family: "Playfair Display", serif;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 0.2px;
    color: #5a4e6a;
    text-align: center;
    margin: auto;
  }
  &__subtitle {
    color: rgba(0, 0, 0, 0.55);
    font-size: 15px;
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
    padding: 30px 15px 35px 15px;
    height: 100%;
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

.booking-category
{
  margin: 90px 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  .btn-category {
    width: 100%;
    max-width: 120px;
    border-radius: 8px;
    font-weight: 500;
    transition: 0.2s ease;
    background: #f9f9f9;
    border: 1px solid #e0e0e0;
    color: #555;
    padding: 6px 18px;
    font-size: 14px;
  }
  .btn-category:hover {
    background: #f3e8ff; /* violet pastel */
    border-color: #c9b4ff;
  }
  .btn-category.active {
    box-shadow: 0 4px 12px rgba(155, 92, 255, 0.12);
    background: #f3e8ff; /* violet pastel */
    border-color: #c9b4ff;
    color: #a06bff; /* violet principal */
  }
}

@media (max-width: 1600px) {
  .booking-category {
    margin: 60px 0 0 0;
  }
}

@media (max-width: 991.98px) {
  .booking-category {
    margin: 60px 0 0 0;
    gap: 10px;
    .btn-category {
      font-size: 13px;
    }
  }
}

@media (max-width: 767.98px) {
  .booking-category {
    margin: 25px 0 0 0;
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
  margin: 16px auto 30px auto;
  cursor: pointer;
  .service-label {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    padding: 12px 14px;
    border: 1px solid #f3e8ff !important;
    font-size: 13.5px;
    font-weight: 500;
    color: #4b4b4b;
    gap: 7px;
  }
  .service-label:hover {
    border-color: #f3e8ff !important;
    background: #f3e8ff !important;
  }
  .service-label .service-icon .fa-angle-down {
    width: 12.5px;
    height: auto;
  }
  .service-menu {
    background: white;
    width: 100%;
    position: absolute;
    border-right: 1px solid #f3e8ff !important;
    border-left: 1px solid #f3e8ff !important;
    border-bottom: 1px solid #f3e8ff !important;
    border-top: none;
    padding: 15px 10px;
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
        background: #f3e8ff !important;
      }
      .service-name {
        font-weight: 600;
      }
    }
    .service-items.active-service {
      background: #f3e8ff !important;
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
  .booking-staff.active-booking-staff {
    margin: -5px auto 25px auto;
  }
  .booking-staff {
    margin: 0 auto 25px auto;
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
        border: 2px solid #d6c7ff; /* gris/violet très clair */
        border-radius: 50%;
        display: inline-block;
        position: relative;
        cursor: pointer;
        transition: 0.2s;
      }
      /* Effet quand sélectionné */
      input[type="radio"]:checked {
        border-color: #bfa0ff;
        background-color: #bfa0ff;
        box-shadow: 0 0 0 3px #f5eeff; /* halo super léger */
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
        font-size: 14px;
      }
      .name.one-card {
        font-size: 15px;
        font-weight: 500;
      }
    }
    &__card__content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      border-radius: 12px;
      border: 1px solid var(--border-soft);
      background: white;
      width: 340px;
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
        width: 220px;
      }
      &__card__content.one-card {
        width: 340px;
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
        width: 300px;
      }
      &__card__content.one-card {
        width: 300px;
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
  margin: 0 auto;
  padding: 2rem 2.5rem 2rem 2.5rem;
  background: #f7f0ff;
  border-radius: 20px;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.08);
  width: 600px;
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
    padding: 1.2rem 1rem;
    width: 100%;
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
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  @media (max-width: 575.98px) {
    background: linear-gradient(
        180deg,
        rgba(245, 242, 255, 0.6),
        rgba(255, 255, 255, 0)
    );
  }
}

.booking-reservation {
  display: flex;
  flex-direction: column;
  .booking-reservation-title {
    margin-bottom: 30px;
    font-size: 1.2rem;
    font-weight: 600;
    text-align: center;
  }
  &__items .day-item {
    padding: 7px 12px;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #6b7280;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    width: 150px;
    &:hover {
      background: #f9fafb;
    }
  }
  &__items .day-item.active {
    background: #f5f3ff;
    color: #7c3aed;
    border-color: #c4b5fd;
    box-shadow: none;
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
      &:hover {
        transform: translateY(-1px);
        background: #e5e7eb;
      }
    }
    .btn-reservation {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    }
    .btn-reservation.active {
      background: #f5f3ff;
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
    width: 40px;
    height: 40px;
    border: 5px solid #b874ff; /* violet */
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
    &__loader {
      width: 35px;
      height: 35px;
    }
  }
}

@media (max-width: 767.98px) {
  .loading {
    height: 100px;
    &__loader {
      width: 30px;
      height: 30px;
    }
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
