<script setup lang="ts">
import {onMounted, ref, nextTick, watch, onUnmounted} from "vue";
import gsap from "gsap";
import { useRouter } from "vue-router";
import Calc from "@/templates/calc/Calc.vue";
import { useAuthStore } from "@/stores/authStore.ts";

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

watch(
  isOpen,
  async (newVal) => {
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
  <header class="header" :class="{'is-header-visible': isHeaderVisible}">
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
        <RouterLink to="/" :class="{ active: $route.path === '/' && !$route.hash }"
        >Accueil</RouterLink
        >
        <RouterLink to="/#equipe" :class="{ active: $route.hash === '#equipe' }"
        >Cabinet</RouterLink
        >
        <RouterLink to="/#expertises" :class="{ active: $route.hash === '#expertises' }"
        >Expertises</RouterLink
        >
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
        <div v-if="roleAdmin()" class="header__actions">
          <font-awesome-icon icon="fa-solid fa-user" @click="toggleMenu()" />
          <div v-show="isVisible" class="header__actions__menu" ref="serviceMenu">
            <RouterLink to="/admin" :class="{ active: $route.path === '/admin' && !$route.hash }">Espace pro</RouterLink>
            <a @click="logout()" href="#" class="logout">Déconnexion</a>
          </div>
        </div>
      </div>
      <!-- CTA -->

      <div>
        <button @click="redirectReservation()" class="header__cta">Prendre RDV</button>
      </div>


      <!-- BURGER (mobile) -->
      <button class="header__burger" @click="toggleMenu()">
        <span></span><span></span><span></span>
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
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1200px;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-radius: 12px;
  z-index: 100;
  padding: 15px 2rem;
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
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 2px;
    }
    span {
      font-size: 12px;
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
    a:hover {
      color: var(--green-page);
    }
    a:last-child {
      opacity: 0.25;
      font-size: 13px;
    }
    a:last-child:hover {
      opacity: 1;
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
    width: 26px;
    height: 26px;
    flex-direction: column;
    justify-content: space-between;
    border: none;
    background: none;
    padding: 0;
    span {
      width: 100%;
      background: #333;
      border-radius: 10px;
      transition: 0.3s;
      height: 3px;
    }
  }
}

/* Apparition de header */

.header.is-header-visible {
  background: white;
  transition: all 180ms ease;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.08),
    0 12px 30px rgba(0, 0, 0, 0.10);
}



/* MENU MOBILE */
.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 0.6rem;
  padding: 2rem;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  &__connected {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  a {
    font-size: 1.2rem;
  }
  .mobile-cta {
    background: #ff4dd4;
    padding: 0.8rem 1rem;
    border-radius: 10px;
    color: white;
    text-align: center;
    border: 0;
  }
}

/* RESPONSIVE */
@media (max-width: 991.98px) {
  .header {
    &__container {
      padding: 0 1rem;
    }
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
  }
  .mobile-menu {
    display: flex;
    text-align: center;
    box-shadow: 0 8px 20px rgba(192, 132, 252, 0.25);
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
  .header {
    &__burger {
      width: 22px;
      height: 22px;
    }
  }
  .mobile-menu {
    display: flex;
    text-align: center;
    box-shadow: 0 8px 20px rgba(192, 132, 252, 0.25);
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
