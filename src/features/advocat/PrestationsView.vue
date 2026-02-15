<script setup lang="ts">
import ScrollTrigger from "gsap/ScrollTrigger";
import {nextTick, onMounted, onUnmounted, ref} from "vue";
import { gsap } from "gsap";
import {useOpeningStatus} from "@/shared/date/useOpeningStatus.ts";
const { isOpen, nextOpening, closingHour } = useOpeningStatus();
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

/*======================
  ANIMATION HERO
======================*/

const heroTitleRef = ref<HTMLElement | null>(null)
const heroSubtitleRef = ref<HTMLElement | null>(null)

function heroAnimation() {
  const tl = gsap.timeline({
    defaults: {
      ease: 'power2.out',
      duration: 0.5
    }
  })

  tl.from(heroTitleRef.value, {
    opacity: 0,
    y: 40
  })

  tl.from(heroSubtitleRef.value, {
    opacity: 0,
    y: 30
  }, "-=0.3")

  tl.from(".btn-primary, .btn-ghost", {
    opacity: 0,
    y: 20,
    stagger: 0.1
  }, "-=0.3")
}

/*======================
  ANIMATION TEAM
======================*/

const cabinetIntroRef = ref<HTMLElement | null>(null)
const cabinetTeamRef1 = ref<HTMLElement | null>(null)
const cabinetTeamRef2 = ref<HTMLElement | null>(null)

function teamAnimation() {

  const isDesktop = window.innerWidth > 767.98

  // SECTION 1
  gsap.from([cabinetIntroRef.value, cabinetTeamRef1.value], {
    scrollTrigger: {
      trigger: cabinetIntroRef.value,
      start: "top 80%",
      once: true
    },
    opacity: 0,
    y: isDesktop ? 40 : 20,
    duration: 0.7,
    stagger: 0.2,
    ease: "power2.out"
  })

  // SECTION 2
  gsap.from([cabinetTeamRef2.value], {
    scrollTrigger: {
      trigger: cabinetTeamRef2.value,
      start: "top 85%",
      once: true
    },
    opacity: 0,
    y: isDesktop ? 40 : 20,
    duration: 0.7,
    ease: "power2.out"
  })
}

/*======================
  ANIMATION
======================*/

const caseSubmitSubtitle = ref<HTMLElement | null>(null)
const caseSubmitTitle = ref<HTMLElement | null>(null)
const caseSubmitText = ref<HTMLElement | null>(null)

const isDesktop = window.innerWidth > 767.98

function animCaseSubmit() {

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: caseSubmitSubtitle.value,
      start: "top 90%",
      once: true
    },
    defaults: {
      ease: "power4.out",
      duration: 0.6
    }
  })

  tl.from(caseSubmitSubtitle.value, {
    opacity: 0,
    y: 20
  })

  tl.from(caseSubmitTitle.value, {
    opacity: 0,
    y: 30
  }, "-=0.4")

  tl.from(caseSubmitText.value, {
    opacity: 0,
    y: 30
  }, "-=0.4")

  tl.fromTo('.case-submit__cta',
    { opacity: 0, x: isDesktop ? 60 : 30 },
    { opacity: 1, x: 0, duration: 0.3 })
}

onMounted(() => {
  heroAnimation()
  teamAnimation()
  animCaseSubmit()
})
</script>

<template>
  <div class="salon-page">
    <!-- MAIN CONTENT -->
    <main>
      <!-- HERO -->
      <section id="hero" class="hero">
       <div class="hero__bg"></div>
        <div class="hero__content">

          <div ref="heroTitleRef">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
              <path d="M32 8V44" stroke="currentColor" stroke-width="4"/>
              <path d="M16 16L6 32H26L16 16Z" fill="currentColor"/>
              <path d="M48 16L38 32H58L48 16Z" fill="currentColor"/>
              <rect x="20" y="44" width="24" height="6" fill="currentColor"/>
            </svg>
            <h1>Maître Julien Morel</h1>
            <h2>Maître Claire Dumas</h2>
          </div>

          <div ref="heroSubtitleRef">
            <p class="hero__subtitle">
              Avocats installés à Évreux et Bernay
            </p>
            <div class="hero-status" :class="isOpen ? 'hero-status--open' : 'hero-status--closed'">
              <span class="hero-status__dot"></span>
              <span v-if="isOpen">
              Ouvert maintenant • Ferme à {{ closingHour }}
            </span>
              <span v-else>
              Fermé • Réouverture {{ nextOpening }}
            </span>
            </div>
          </div>

          <div class="hero__actions" ref="heroButtonsRef">
            <a href="tel:0780468148" class="btn btn-primary">07 80 46 81 48</a>
            <router-link to="/contact/form" class="btn btn-ghost">Contactez-nous</router-link>
          </div>
        </div>
      </section>
      <!-- INTRO -->
      <section id="cabinet-intro" class="intro" ref="cabinetIntroRef">
        <h2>Une équipe dynamique à votre écoute</h2>
        <p>
          Installé à <strong>Évreux</strong> et <strong>Bernay</strong>, notre cabinet
          offre une proximité et une facilité d’accueil.
        </p>
        <p class="intro__small">
          Rattaché au Barreau de l’Eure, nous vous accompagnons dans vos démarches
          avec rigueur, écoute et disponibilité.
        </p>
      </section>
      <!-- ÉQUIPE -->

      <section id="equipe" class="sections">
        <!-- BLOC 1 : ÉQUIPE -->
        <section class="block block--team" ref="cabinetTeamRef1">
          <div class="block__grid">
            <div class="block__content block-1">
              <h2>Une équipe dynamique à votre écoute</h2>
              <p class="block__content__subtitle">Cabinet implanté à Évreux et Bernay.</p>
              <ul>
                <li>Maître Julien Morel</li>
                <li>Maître Claire Dumas</li>
                <li>Élodie Martin</li>
                <li>Nicolas Renaud</li>
              </ul>
            </div>
            <img src="@/assets/images/team.jpg" alt="">
          </div>
        </section>
        <!-- BLOC 2 : DOMAINES -->
        <section id="expertises" class="block block--domains" ref="cabinetTeamRef2">
          <div class="block__grid">
            <img src="@/assets/images/pexels-smuldur-30573089.jpg" alt="">
            <div class="block__content block-2">
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

      <section id="engagements" class="engagements">
        <h2>Nos engagements</h2>
        <div class="engagements__grid">
          <div class="engagement">Écoute</div>
          <div class="engagement">Disponibilité</div>
          <div class="engagement">Rigueur</div>
          <div class="engagement">Proximité</div>
        </div>
      </section>

      <!-- MENUS DÉROULANT -->
      <section id="procedures" class="accordion">
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

      <!-- ENGAGEMENT QUALITY -->

      <section id="engagements-quality" class="engagements-quality">
        <div class="engagements-quality__container">
          <span class="engagements-quality__surtitle">Avocats à Évreux et Bernay</span>
          <h2 class="engagements-quality__title">Nos engagements de qualité</h2>
          <div class="engagements-quality__grid">
            <div class="engagements-quality__item">
              <div class="engagements-quality__icon">📘</div>
              <h3>Écoute</h3>
              <p>Une analyse attentive de votre situation pour vous proposer une stratégie adaptée.</p>
            </div>
            <div class="engagements-quality__item">
              <div class="engagements-quality__icon">🏛️</div>
              <h3>Rigueur</h3>
              <p>Un suivi précis et sérieux de chaque dossier, dans le respect des règles déontologiques.</p>
            </div>
            <div class="engagements-quality__item">
              <div class="engagements-quality__icon">🤝</div>
              <h3>Proximité</h3>
              <p>Un accompagnement humain et disponible, du premier contact à la conclusion du dossier.</p>
            </div>
            <div class="engagements-quality__item">
              <div class="engagements-quality__icon">€</div>
              <h3>Transparence</h3>
              <p>Des honoraires clairement expliqués, sans surprise.</p>
            </div>
          </div>
        </div>
      </section>

      <!--  AFFAIRE -->

      <section class="case-submit" id="affaire">
        <div class="case-submit__bg">
          <img src="@/assets/images/affaire.jpg" alt="Une affaire à soumettre à notre cabinet">
        </div>
        <div class="case-submit__content">
          <span class="case-submit__subtitle" ref="caseSubmitSubtitle">Avocats à Évreux et Bernay</span>
          <h2 ref="caseSubmitTitle">Une affaire à soumettre<br>à notre cabinet&nbsp;?</h2>
          <p ref="caseSubmitText">
            L’accueil téléphonique de Maître Julien Morel  est ouvert
            du lundi au vendredi de 9h30 à 12h30 et de 13h30 à 17h.
            <br>
            Contactez-nous pour un rendez-vous.
          </p>

          <router-link to="/contact/form" class="case-submit__cta">Contactez-nous</router-link>
        </div>
      </section>

      <!--  CONTACT CABINET -->

      <section class="contact-quick">
        <div class="contact-quick__container">
          <div class="contact-quick__item">
            <div class="contact-quick__icon">📍</div>
            <h4>Adresse</h4>
            <p>
              18 Rue de la Sérénité<br />
              27000 Évreux
            </p>
          </div>
          <div class="contact-quick__item">
            <div class="contact-quick__icon">📞</div>
            <h4>Téléphone</h4>
            <p>07 80 46 81 48</p>
          </div>
          <div class="contact-quick__item">
            <div class="contact-quick__icon">✉️</div>
            <h4>E-mail</h4>
            <p>contact@advocat.fr</p>
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
  min-height: 100vh;
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
    font-size: 18px;
    margin-top: 15px;
    font-style: italic;
    opacity: .9;
  }
  .hero-status {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 1rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 500;
    backdrop-filter: blur(6px);
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    transition: all 0.3s ease;
  }
  .hero-status__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .hero-status--open .hero-status__dot {
    background: #4ade80;
  }
  .hero-status--closed .hero-status__dot {
    background: #ef4444;
  }
  /* IMAGE */
  &__bg {
    position: absolute;
    inset: 0;
    background-image: url('@/assets/images/tribunal-2.jpg');
    background-size: 140% auto;
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
      width: 90px;
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
    font-size: 15px;
    color: #fff;
  }
  .btn-ghost {
    background: rgba(255, 255, 255, .25);
    color: #fff;
    backdrop-filter: blur(4px);
    font-size: 15px;
  }
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 2;
}

@media (max-width: 1300px) {
  .hero__bg {
    background-size: cover;
  }
}

@media (max-width: 991.98px) {
  .hero {
    h1 {
      font-size: 1.6rem;
      margin-bottom: 15px;
    }
    h2 {
      font-size: 1.2rem;
      font-weight: 500;
    }
    &__subtitle {
      font-size: 17px;
      margin-top: 10px;
    }
    .hero-status {
      font-size: 0.75rem;
    }
    &__content {
      position: relative;
      z-index: 3;
      color: #fff;
      text-align: center;
    }
    &__content svg {
      width: 50px;
      margin-bottom: 0.3rem;
      color: #c7a44a;
    }
    &__actions {
      margin-top: 1.2rem;
      gap: 1rem;
    }
    &__logo {
      margin-bottom: 1rem;
    }
    .btn {
      padding: .8rem 1.6rem;
    }
    .btn-primary {
      font-size: 14px;
    }
    .btn-ghost {
      font-size: 14px;
    }
  }
}

@media (max-width: 767.98px) {
  .hero {
    height: auto;
    min-height: 100svh;
    h1 {
      font-size: 1.8rem;
      margin-bottom: 15px;
    }
    h2 {
      font-size: 1.2rem;
      font-weight: 500;
    }
    &__subtitle {
      font-size: 16px;
      margin-top: 10px;
    }
    .hero-status {
      font-size: 0.70rem;
    }
    &__bg {
      background-position: center 65%;
    }
    &__content {
      position: relative;
      z-index: 3;
      color: #fff;
      text-align: center;
    }
    &__content svg {
      width: 50px;
      margin-bottom: 0.3rem;
      color: #c7a44a;
    }
    &__actions {
      margin-top: 1.2rem;
      gap: 1rem;
    }
    &__logo {
      margin-bottom: 1rem;
    }
    .btn {
      padding: .8rem 1.6rem;
    }
    .btn-primary {
      font-size: 14px;
    }
    .btn-ghost {
      font-size: 14px;
    }
  }
}

/*===================
  INTRO
===================*/

.intro {
  max-width: 900px;
  margin: 3rem auto 0 auto;
  padding: 0 20px;
  text-align: center;
  h2 {
    font-size: 32px;
    color: var(--green-page);
    margin-bottom: 15px;
  }
  p {
    line-height: 1.6;
    font-size: 16px;
    margin-bottom: 20px;
  }

  &__small {
    opacity: .75;
    font-size: 16px;
  }
}

@media (max-width: 991.98px) {
  .intro {
    margin: 3rem 20px 3rem 20px;
    h2 {
      font-size: 24px;
      color: var(--green-page);
      margin-bottom: 15px;
    }
    p {
      line-height: 1.6;
      margin-bottom: 10px;
      font-size: 14px;
    }
    &__small {
      opacity: .75;
      font-size: 16px;
    }
  }
}

@media (max-width: 767.98px) {
  .intro {
    margin: 3rem 10px 0 10px;
    h2 {
      font-size: 19px;
      color: var(--green-page);
      margin-bottom: 15px;
    }
    p {
      line-height: 1.5;
      margin-bottom: 15px;
      font-size: 13px;
    }
    &__small {
      opacity: .75;
      font-size: 16px;
    }
  }
}

/*===================
  TEAM
===================*/

.sections {
  background: #fff;
}

.block {
  padding: 5rem 20px;
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
    font-size: 28px;
  }
  &__content__subtitle {
    margin-top: -15px;
    font-size: 18px;
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

/* responsive */
@media (max-width: 991.98px) {
  .block {
    padding: 5rem 10px;
    &__grid {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
    &__content h2 {
      color: var(--green-page);
      text-align: center;
      font-size: 24px;
    }
    &__content__subtitle {
      text-align: center;
      margin-top: -12px;
      font-size: 16px;
    }
    &__content ul li {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
    }
    .values {
      grid-template-columns: 1fr 1fr;
    }
  }
}

@media (max-width: 767.98px) {
  .block {
    padding: 2rem 10px;
    &__grid {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }
    &__content h2 {
      color: var(--green-page);
      text-align: center;
      font-size: 19px;
    }
    &__content__subtitle {
      margin-top: -14px;
      text-align: center;
      font-size: 14px;
    }
    &__content ul li {
      margin-top: 17px;
      font-size: 12px;
    }
    .values {
      grid-template-columns: 1fr 1fr;
    }
  }
}

/*===================
  ENGAGEMENTS
===================*/

.engagements {
  padding: 80px 20px;
  background: #fafafa;
  text-align: center;
  max-width: 1400px;
  margin: 0 auto;
  h2 {
    font-size: 25px;
    margin-bottom: 40px;
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    justify-content: center;
    gap: 20px;
    .engagement {
      font-size: 15px;
      background: #ffffff;
      padding: 30px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      font-weight: 500;
    }
  }
}

@media (max-width: 991.98px) {
  .engagements {
    padding: 50px 20px;
    h2 {
      font-size: 20px;
      margin-bottom: 30px;
    }
    &__grid {
      grid-template-columns: repeat(1, 1fr);
      .engagement {
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 767.98px) {
  .engagements {
    padding: 40px 20px;
    h2 {
      font-size: 16px;
      margin-bottom: 20px;
    }
    &__grid {
      gap: 15px;
      .engagement {
        font-size: 13px;
      }
    }
  }
}

/*===================
  ACCORDIONS
===================*/

.accordion {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
  @media (max-width: 991.98px) {
    margin: 30px auto;
  }
  @media (max-width: 767.98px) {
    margin: 40px auto;
  }
}

.accordion-item {
  border-bottom: 1px solid #ccc;
}

.accordion-header {
  width: 100%;
  background: none;
  border: none;
  padding: 25px 0;
  font-size: 20px;
  color: #8dbf67;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  @media (max-width: 991.98px) {
    font-size: 18px;
  }
  @media (max-width: 767.98px) {
    padding: 20px 0;
    font-size: 16px;
  }
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
  @media (max-width: 991.98px) {
    font-size: 18px;
    width: 26px;
    height: 26px;
  }
  @media (max-width: 767.98px) {
    font-size: 16px;
    width: 21px;
    height: 21px;
  }
}

.accordion-content p {
  padding: 0 0 18px 0;
  line-height: 1.6;
  font-size: 15px;
  @media (max-width: 991.98px) {
    font-size: 14px;
  }
  @media (max-width: 767.98px) {
    font-size: 12px;
  }
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

/*===================
  ENGAGEMENTS QUALITY
===================*/

.engagements-quality {
  background: #ffffff;
  padding: 80px 20px;
  &__container {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }
  &__surtitle {
    font-size: 14px;
    color: #7aa35a;
    margin-bottom: 8px;
    display: block;
  }
  &__title {
    font-size: 32px;
    margin-bottom: 48px;
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 34px;
  }
  &__item {
    background: #f9f9f9;
    padding: 32px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    h3 {
      font-size: 19px;
      margin-bottom: 10px;
      font-weight: 600;
      line-height: 1.4;
    }
    p {
      line-height: 22px;
      font-size: 16px;
    }
  }
  &__icon {
    font-size: 32px;
    margin-bottom: 16px;
  }
}


/* Responsive */
@media (max-width: 1024px) {
  .engagements-quality__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 991.98px) {
  .engagements-quality {
    &__grid {
      grid-template-columns: 1fr;
      gap: 30px;
    }
    &__item {
      padding: 32px 24px;
      h3 {
        font-size: 17px;
        margin-bottom: 10px;
      }
      p {
        line-height: 20px;
        font-size: 15px;
      }
    }
  }
}

@media (max-width: 767.98px) {
  .engagements-quality {
    padding: 30px 10px 40px 10px;
    &__surtitle {
      font-size: 14px;
      margin-bottom: 8px;
    }
    &__title {
      font-size: 20px;
      margin-bottom: 30px;
    }
    &__grid {
      grid-template-columns: 1fr;
      gap: 30px;
    }
    &__item {
      padding: 30px 24px;
      h3 {
        font-size: 16px;
        margin-bottom: 10px;
      }
      p {
        line-height: 20px;
        font-size: 14px;
      }
    }
  }
}

/*===================
  AFFAIRE
===================*/

.case-submit {
  position: relative;
  height: 420px;
  overflow: hidden;
  border-radius: 16px;
  margin: 80px 20px 0 20px;
  h2 {
    font-size: 42px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  p {
    font-size: 16px;
    line-height: 1.6;
    max-width: 680px;
    margin: 0 auto 28px;
    opacity: 0.95;
  }
  &__bg {
    position: absolute;
    inset: 0;
  }
  &__bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &__bg::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
  }
  &__content {
    position: relative;
    z-index: 2;
    max-width: 900px;
    height: 100%;
    margin: 0 auto;
    padding: 0 32px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #ffffff;
    text-align: center;
  }
  &__subtitle {
    font-size: 14px;
    letter-spacing: 1px;
    opacity: 0.85;
    margin-bottom: 12px;
  }
  &__cta {
    align-self: center;
    background: #ffffff;
    color: #333;
    padding: 12px 28px;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  &__cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  }
}

@media (max-width: 991.98px) {
  .case-submit {
    margin: 0 20px 0 20px;
  }
}

@media (max-width: 767.98px) {
  .case-submit {
    margin: 20px 0 0 0;
    border-radius: 0;
    h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      font-size: 15px;
    }
  }
}

/*===================
  CONTACT
===================*/

.contact-quick {
  background: #ffffff;
  padding: 80px 60px;
  &__container {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
    text-align: center;
  }
  &__item h4 {
    margin: 12px 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: #7da85a; /* ton vert */
  }
  &__item p {
    font-size: 15px;
    line-height: 1.6;
    color: #333;
  }
  &__icon {
    font-size: 28px;
    margin-bottom: 8px;
  }
}

/* Responsive */

@media (max-width: 991.98px) {
  .contact-quick {
    &__item p {
      font-size: 15px;
    }
    &__item h4 {
      font-size: 17px;
    }
    &__icon {
      font-size: 25px;
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 767.98px) {
  .contact-quick {
    padding: 60px 60px;
    &__container {
      grid-template-columns: 1fr;
      gap: 32px;
    }
    &__item h4 {
      font-size: 17px;
    }
    &__item p {
      font-size: 14px;
    }
    &__icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
  }
}

/*===================
  SCROLL TOP
===================*/

.scroll-top {
  position: fixed;
  right: 15px;
  bottom: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--green-page);
  color: white;
  border: none;
  cursor: pointer;
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
