<script setup lang="ts">
import ScrollTrigger from "gsap/ScrollTrigger";
import {nextTick, onMounted, onUnmounted, ref} from "vue";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger);

/*======================
  SCROLL PAGE
======================*/

const showScrollTop = ref(false);

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});



const items = [
  { title: 'Avocat divorce', content: 'Accompagnement dans les procédures de divorce.' },
  { title: 'Avocat séparation', content: 'Organisation juridique adaptée.' },
  { title: 'Avocat partage', content: 'Liquidation du régime matrimonial.' },
  { title: 'Avocat succession', content: 'Conseil et assistance successorale.' },
  { title: 'Violences conjugales', content: 'Procédures d’urgence.' }
]


const openIndex = ref(null)
const contents = ref([])

const toggle = async (index) => {
  // fermer l'ancien
  if (openIndex.value !== null && openIndex.value !== index) {
    gsap.to(contents.value[openIndex.value], {
      height: 0,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.inOut'
    })
  }

  // toggle actuel
  if (openIndex.value === index) {
    gsap.to(contents.value[index], {
      height: 0,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.inOut'
    })
    openIndex.value = null
  } else {
    openIndex.value = index
    await nextTick()
    gsap.fromTo(
      contents.value[index],
      { height: 0, opacity: 0 },
      {
        height: 'auto',
        opacity: 1,
        duration: 0.45,
        ease: 'power2.out'
      }
    )
  }
}




</script>





<template>
  <div class="salon-page">
    <!-- MAIN CONTENT -->
    <main>
      <!-- HERO -->
      <section class="hero">
        <div class="hero__bg"></div>
        <div class="hero__content">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8V44" stroke="currentColor" stroke-width="4"/>
            <path d="M16 16L6 32H26L16 16Z" fill="currentColor"/>
            <path d="M48 16L38 32H58L48 16Z" fill="currentColor"/>
            <rect x="20" y="44" width="24" height="6" fill="currentColor"/>
          </svg>
          <h1>Maître Evelyne BOYER</h1>
          <h2>Maître Delphine BERGERON-DURAND</h2>
          <p class="hero__subtitle">
            Avocats installés à Évreux et Louviers
          </p>
          <div class="hero__actions">
            <a href="tel:0780468148" class="btn btn-primary">07 80 46 81 48</a>
            <a href="/contact" class="btn btn-ghost">Contactez-nous</a>
          </div>
        </div>
      </section>
      <!-- INTRO -->
      <section class="intro">
        <h2>Une équipe dynamique à votre écoute</h2>
        <p>
          Installé à <strong>Évreux</strong> et <strong>Louviers</strong>, notre cabinet
          offre une proximité et une facilité d’accueil.
        </p>
        <p class="intro__small">
          Rattaché au Barreau de l’Eure, nous vous accompagnons dans vos démarches
          avec rigueur, écoute et disponibilité.
        </p>
      </section>
      <!-- ÉQUIPE -->

      <section class="sections">
        <!-- BLOC 1 : ÉQUIPE -->
        <section class="block block--team">
          <div class="block__grid">
            <div class="block__content">
              <h2>Une équipe dynamique à votre écoute</h2>
              <p class="block__content__subtitle">Cabinet implanté à Évreux et Louviers.</p>
              <ul>
                <li>Maître Evelyne BOYER</li>
                <li>Maître Delphine BERGERON-DURAND</li>
                <li>Emmanuelle PATTINEZ</li>
                <li>Cécile BARON</li>
              </ul>
            </div>
            <img src="@/assets/images/team.jpg" alt="">
          </div>
        </section>
        <!-- BLOC 2 : DOMAINES -->
        <section class="block block--domains">
          <div class="block__grid">
            <img src="@/assets/images/pexels-smuldur-30573089.jpg" alt="">
            <div class="block__content">
              <h2>Des domaines de compétence diversifiés</h2>
              <ul class="checks">
                <li>Droit de la famille</li>
                <li>Droit des personnes</li>
                <li>Droit pénal</li>
                <li>Droit civil</li>
              </ul>
            </div>
          </div>
        </section>
      </section>


      <section class="engagements">
        <h2>Nos engagements</h2>

        <div class="engagements__grid">
          <div class="engagement">Écoute</div>
          <div class="engagement">Disponibilité</div>
          <div class="engagement">Rigueur</div>
          <div class="engagement">Proximité</div>
        </div>
      </section>




      <!-- MENUS DÉROULANT -->
      <section class="accordion">
        <div class="accordion-item" v-for="(item, index) in items" :key="index">
          <button class="accordion-header" @click="toggle(index)">
            {{ item.title }}
            <span class="icon">{{ openIndex === index ? '−' : '+' }}</span>
          </button>
          <div class="accordion-content" ref="contents">
            <p>{{ item.content }}</p>
          </div>
        </div>
      </section>


      <!-- REVENUR EN HAUT -->
      <button
        class="scroll-top"
        :class="{ 'is-visible': showScrollTop }"
        @click="scrollToTop"
      >
        ↑
      </button>
    </main>
  </div>
</template>

<style scoped lang="scss">
/*==========================
  SALON PAGE
==========================*/

.salon-page {
  overflow: hidden;
  z-index: 6;
}

/*==========================
  HERO
==========================*/


@keyframes heroPan {
  from {
    background-position: left center;
  }
  to {
    background-position: right center;
  }
}

.hero {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  h1 {
    font-size: 2rem;
    margin-bottom: 25px;
    font-weight: 600;
  }
  h2 {
    font-size: 1.8rem;
    font-weight: 500;
  }
  &__subtitle {
    margin-top: 15px;
    font-style: italic;
    opacity: .9;
  }
  /* IMAGE */
  &__bg {
    position: absolute;
    inset: 0;
    background-image: url('/src/assets/images/tribunal.jpg'); /* ✅ */
    background-size: 120% auto;     /* 👈 important */
    background-position: left center;
    background-repeat: no-repeat;
    z-index: 1;
    animation: heroPan 40s linear infinite alternate;
  }
  &__content {
    position: relative;
    z-index: 3;
    color: #fff;
    text-align: center;
    svg {
      color: #c7a44a;
    }
  }
  &__actions {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  &__logo {
    width: 90px;
    margin-bottom: 1.5rem;
  }
  .btn {
    padding: .8rem 1.6rem;
    border-radius: 999px;
    font-weight: 500;
    text-decoration: none;
  }
  .btn-primary {
    background: var(--green-page);
    color: #fff;
  }
  .btn-ghost {
    background: rgba(255,255,255,.25);
    color: #fff;
    backdrop-filter: blur(4px);
  }
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 2;
}

/*===================
  INTRO
===================*/

.intro {
  max-width: 900px;
  margin: 4rem auto 2rem;
  padding: 0 1.5rem;
  text-align: center;
  h2 {
    font-size: 30px;
    color: var(--green-page);
    margin-bottom: 15px;
  }

  p {
    line-height: 1.6;
    margin-bottom: 20px;
  }

  &__small {
    opacity: .75;
    font-size: 16px;
  }




}


/*===================
  TEAM
===================*/

.sections {
  background: #fff;
}

.block {
  padding: 5rem 1.5rem;
  &__grid {
    max-width: 1800px;
    margin: auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
  }
  &__content h2 {
    color: var(--green-page);
    margin-bottom: 20px;
  }
  &__content__subtitle {
    margin-top: -10px;
  }
  &__content ul li {
    margin-top: 20px;
  }
  img {
    width: 100%;

    height: 600px;
    border-radius: 16px;
  }
}




.checks li::before {
  content: "✓ ";
  color: var(--green-page);
}

.block--values {
  background: #f7f7f7;
  text-align: center;
}

.values {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 1.5rem;
}

.values div {
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.1);
}

/* responsive */
@media (max-width: 900px) {
  .block__grid {
    grid-template-columns: 1fr;
  }
  .values {
    grid-template-columns: 1fr 1fr;
  }
}


// ENGUAGEMENTS

.engagements {
  padding: 80px 20px;
  background: #fafafa;
  text-align: center;
}

.engagements h2 {
  margin-bottom: 40px;
}

.engagements__grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.engagement {
  background: #ffffff;
  padding: 30px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  font-weight: 500;
}


// ACCORDIONS


.accordion {
  max-width: 1000px;
  margin: 60px auto;
}

.accordion-item {
  border-bottom: 1px solid #ccc;
}

.accordion-header {
  width: 100%;
  background: none;
  border: none;
  padding: 18px 0;
  font-size: 20px;
  color: #8dbf67;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.accordion-header .icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #8dbf67;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  transition: transform 200ms ease;
}



.accordion-content p {
  padding: 0 0 18px 0;
  line-height: 1.6;
}

.accordion-item.active .accordion-content {
  max-height: 200px;
}

.accordion-item.active .icon {
  transform: rotate(45deg);
}








.accordion-content {
  overflow: hidden;
  height: 0;
  opacity: 0;
}








// SCROLL TOP

.scroll-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--green-page);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(162, 89, 255, 0.35);
  opacity: 0;
  pointer-events: none;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 100;
}

.scroll-top.is-visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.salon-page {
  overflow: hidden;
  z-index: 6;
}

</style>
