<script setup lang="ts">
import {onMounted, ref, nextTick, watch, onUnmounted} from "vue";
import { useRouter } from "vue-router";
import Calc from "@/templates/calc/Calc.vue";
import { useAuthStore } from "@/stores/authStore.ts";
import gsap from "gsap";

const authStore = useAuthStore();

const isHeaderVisible = ref(false)


const onScroll = () => {
  isHeaderVisible.value = window.scrollY > 30
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
/*===============
  ÉTAT CONNEXION, RÉCUPÉRATION UTILISATEUR
===============*/

function roleAdmin() {
  return authStore.isLoggedIn;
}

onMounted(async () => {
  try {
    await authStore.me();
  } catch (e) {
    console.error(e);
  }
});

/*===============
  DÉCONNEXION
===============*/

function logout() {
  authStore.logout();
  router.push({ path: "/login" });
  closeMenu();
}

/*===============
  ANIMATION MENU MOBILE
===============*/

const serviceMenu = ref<HTMLElement | null>(null);

const isOpen = ref<boolean>(false);
const isVisible = ref<boolean>(false);

watch(isOpen, async (newVal) => {
    if (newVal) {
      isVisible.value = true;

      await nextTick();

      if (!serviceMenu.value) return;

      gsap.fromTo(
        serviceMenu.value,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
      );
    } else {
      if (!serviceMenu.value) return;

      gsap.to(serviceMenu.value, {
        opacity: 0,
        y: -12,
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => {
          isVisible.value = false;
        },
      });
    }
  },
  { flush: "post" },
);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

/*===============
  ANIMATION HEADER
===============*/

const headerRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  await nextTick();

  gsap.from(headerRef.value, {
    opacity: 0,
    duration: 0.6,
    y: -15,
    ease: "power2.out",
  });
});

/*===============
  REDIRECTION RÉSERVATION
===============*/

const router = useRouter();

function redirectReservation() {
  router.push({ path: "/booking" });
  closeMenu();
}

const closeMenu = () => {
  isOpen.value = false;
};
</script>

<template>
  <header class="header" :class="{'is-scrolled': isHeaderVisible, 'menu-open': isOpen }">
    <div class="header__container" ref="headerRef">
      <!-- LOGO -->
      <div class="header__brand">
        <div class="header__logo">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8V44" stroke="currentColor" stroke-width="4"/>
            <path d="M16 16L6 32H26L16 16Z" fill="currentColor"/>
            <path d="M48 16L38 32H58L48 16Z" fill="currentColor"/>
            <rect x="20" y="44" width="24" height="6" fill="currentColor"/>
          </svg>
        </div>
        <div class="d-flex flex-column">
          <p>Cabinet Avocat</p>
          <span>Consultations sur rendez-vous</span>
        </div>
      </div>
      <!-- NAV DESKTOP -->
      <div class="header__nav">
        <RouterLink to="/" :class="{ active: $route.path === '/' && !$route.hash }">Accueil</RouterLink>
        <RouterLink to="/#equipe" :class="{ active: $route.path === '/#equipe' && $route.path }"></RouterLink>
        <RouterLink
          to="#procedures"
          :class="{ active: $route.path === '#procedures' && !$route.hash }"
        >Procédures</RouterLink
        >
        <RouterLink
          to="/contact/form"
          :class="{ active: $route.path === '/contact/form' && !$route.hash }"
        >Contact</RouterLink
        >
        <div v-if="!roleAdmin()">
          <RouterLink to="/login" :class="{ active: $route.path === '/login' && !$route.hash }"
          >Espace pro</RouterLink
          >
        </div>
        <div v-else>
          <a @click="logout()" href="#">Déconnexion</a>
        </div>
      </div>
      <!-- CTA -->

      <div>
        <button @click="redirectReservation()" class="header__cta">Prendre RDV</button>
      </div>

      <!-- BURGER (mobile) -->
      <button class="header__burger" @click="toggleMenu()">
        <font-awesome-icon icon="fa-solid fa-bars" />
      </button>
    </div>
    <!-- MENU MOBILE -->
    <div v-show="isVisible" class="mobile-menu" ref="serviceMenu">
      <RouterLink
        to="/"
        @click="closeMenu"
        :class="{ active: $route.path === '/' && !$route.hash }"
      >
        Accueil
      </RouterLink>
      <RouterLink to="/#about" @click="closeMenu" :class="{ active: $route.hash === '#about' }">
        À propos
      </RouterLink>
      <RouterLink
        to="/#services"
        @click="closeMenu"
        :class="{ active: $route.hash === '#services' }"
      >
        Services
      </RouterLink>
      <RouterLink
        to="/#testimonials"
        @click="closeMenu"
        :class="{ active: $route.hash === '#testimonials' }"
      >
        Témoignages
      </RouterLink>
      <RouterLink
        to="/contact/form"
        @click="closeMenu"
        :class="{ active: $route.path === '/contact/form' && !$route.hash }"
      >Contact
      </RouterLink>
      <div v-if="!roleAdmin()">
        <RouterLink
          to="/login"
          @click="closeMenu()"
          :class="{ active: $route.path === '/login' && !$route.hash }"
        >Connexion</RouterLink
        >
      </div>
      <div v-else class="mobile-menu__connected">
        <RouterLink
          to="/admin"
          @click="closeMenu()"
          :class="{ active: $route.path === '/admin' && !$route.hash }"
        >Espace pro</RouterLink
        >
        <a @click="logout()" href="#" class="logout-mobile">Déconnexion</a>
      </div>
      <button @click="redirectReservation()" class="mobile-cta">Prendre RDV</button>
    </div>
  </header>
  <Calc :isVisible="isVisible" @close="isOpen = false" :transparent="true" />
</template>

<style scoped lang="scss">
.header {
  //left: 0;
  right: 0;
  position: fixed;
  top: 20px;


  //transform: translateX(-50%);
  //max-width: 1200px;
  background: transparent;
  //backdrop-filter: none;
  //-webkit-backdrop-filter: none;
  border-radius: 12px;
  z-index: 100;
  padding: 15px 2rem;

  margin: 0 20px;

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }
  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    p {
      color: white;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 2px;
    }
    span {
      font-size: 12px;
      color: white;
    }
  }
  /* LOGO */
  &__logo {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: white;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #c7a44a;
    svg {
      width: 20px;
      height: 20px;
      color: var(--green-page);
    }
    span {
      font-weight: 600;
      font-size: 1.1rem;
    }
  }
  .active {
    color: var(--green-page);
  }
  /* NAV DESKTOP */
  &__nav {
    display: flex;
    align-items: center;
    gap: 1.8rem;
    a {
      font-size: 14px;
      color: white;
      transition: 0.2s;
    }
    a.is-header-visible {
      color: red;
    }
    a:hover {
      color: var(--green-page);
    }
  }
  &__actions {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1.8rem;
    .logout {
      color: #9ca3af; /* gris doux */
      font-weight: 500;
    }
    .logout:hover {
      color: #e5e7eb; /* gris clair */
    }
    .fa-user {
      cursor: pointer;
      font-size: 18px;
      color: #333;
      transition: color 0.2s ease;
    }
    .fa-user:hover {
      color: #b22ad9;
    }
  }
  &__actions__menu {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    position: absolute;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    padding: 20px 30px;
    gap: 12px;
    top: 61px;
  }
  /* CTA */
  &__cta {
    background: #8dbf67;
    color: white;
    padding: 0.8rem 4rem;
    border-radius: 20px;
    font-weight: 600;
    border: none;
    cursor: pointer;
  }
  /* BURGER */
  &__burger {
    cursor: pointer;
    display: none;
    background: none;
    padding: 0;
  }
  &__burger .fa-bars {
    color: white;
    font-size: 22px;
    width: 23px;
    height: 23px;
  }
}

/* Suppression border radios du header avec le menu mobile  */

.header.menu-open {
  border-radius: 12px 12px 0 0;
}

/* Apparition de header */

.header.is-scrolled {
  background: white;
  transition: all 180ms ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08), 0 12px 30px rgba(0, 0, 0, 0.10);
}

.header.is-scrolled a {
  color: #1a1a1a;
}

.header.is-scrolled .header__brand p {
  color: #1a1a1a;
}

.header.is-scrolled .header__brand span {
  color: #1a1a1a;
}

.header.is-scrolled a:hover {
  color: var(--green-page);
}

.header.is-scrolled a.active {
  color: var(--green-page);
}



@media (max-width: 1600px) {
  .header {
    width: 100%;
    max-width: 1300px;

    //margin: 0 20px 0 20px;
  }
}

/* RESPONSIVE */
@media (max-width: 1300px) {
  .header {
    width: 100%;
    //max-width: 1000px;


    //margin: 0 20px 0 20px;

  }
  .header__brand p {
    font-size: 15px;
    font-weight: 600;
  }
  .header__brand span {
    font-size: 12px;
  }
  .header__nav,
  .header__cta {
    display: none;
  }
  .header__burger {
    display: flex;
    background: black;
    padding: 8px;
    opacity: 0.7;
    border: none;
    border-radius: 10px;
  }
}

@media (max-width: 991.98px) {
  .header {





    padding: 15px 1rem;
  }
}

@media (max-width: 767.98px) {
  .header {

    padding: 15px 10px;
    &__container {
      width: 100%;
    }
    .header__burger {
      padding: 8px;
    }
    &__burger .fa-bars {
      color: white;
      font-size: 22px;
      width: 20px;
      height: 20px;
    }
  }
}








/* MENU MOBILE */

.mobile-menu {

  width: 100%;
  max-width: 1300px;
  position: fixed;
  top: 69px;
  left: 0;
  padding: 20px;


  display: none;
  flex-direction: column;
  gap: 0.6rem;
  &__connected {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  a {
    font-size: 1.2rem;
  }
  .mobile-cta {
    background: var(--green-page);
    padding: 0.8rem 1rem;
    border-radius: 10px;
    color: white;
    text-align: center;
    border: 0;
  }
}

@media (max-width: 1600px) {
  .header {
    width: 100%;
    max-width: 1300px;
  }
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .mobile-menu {
    display: flex;
    text-align: center;
    background: white;
    a {
      color: #333;
      font-size: 14px;
      padding: 8px 0;
    }
    .mobile-cta {
      border: 0;
      width: 30%;
      margin: 10px auto 0 auto;
      font-size: 12px;
    }
    .logout-mobile {
      color: red;
    }
  }
}

@media (max-width: 767.98px) {
  .mobile-menu {
    display: flex;
    text-align: center;
    a {
      color: #333;
      font-size: 13px;
      padding: 8px 0;
    }
    .mobile-cta {
      border: 0;
      width: 37%;
      margin: 10px auto 0 auto;
      font-size: 11px;
    }
  }
}
</style>
