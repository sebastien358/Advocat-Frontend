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
    y: isDesktop ? 30 : 10,
    duration: isDesktop ? 0.7 : 0.3,
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
    y: isDesktop ? 30 : 10,
    duration: isDesktop ? 0.7 : 0.3,
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

        <p class="intro__lead">
          Installé à <strong>Évreux</strong> et <strong>Bernay</strong>, notre cabinet offre une proximité et une facilité d’accueil.
        </p>

        <p class="intro__small">
          Rattaché au Barreau de l’Eure, nous vous accompagnons dans vos démarches avec rigueur, écoute et disponibilité.
        </p>

        <p class="intro__small">
          Notre cabinet est composé à ce jour de deux avocats :
        </p>

        <div class="intro__names">
          <p><strong>Maître Julien Morrecchi</strong></p>
          <p><strong>Maître Claire Dumas</strong></p>
        </div>

        <p class="intro__small">
          Notre équipe se compose par ailleurs d’une assistante :
        </p>

        <div class="intro__names">
          <p><strong>Secrétariat du cabinet</strong></p>
        </div>

        <p class="intro__small">
          À votre écoute, à votre disposition et en étroite collaboration avec l’avocat en charge de votre dossier, pour assurer le meilleur suivi possible.
        </p>
      </section>

      <!-- ÉQUIPE -->

      <section id="equipe" class="sections">
        <!-- BLOC 1 : ÉQUIPE -->
        <section class="block block--team" ref="cabinetTeamRef1">
          <div class="block__grid">
            <div class="block__content block-1">
              <h2>Une équipe dédiée à la défense de vos intérêts</h2>
              <p class="block__content__subtitle">Cabinet implanté à Évreux et Bernay.</p>
              <ul>
                <li>Maître Julien Morel</li>
                <li>Maître Claire Dumas</li>
                <li>Élodie Martin</li>
                <li>Nicolas Renaud</li>
              </ul>
            </div>
            <img src="@/assets/images/team-2.jpg" alt="">
          </div>
        </section>

        <!-- BLOC 2 : DOMAINES -->

        <section id="expertises" class="block block--team" ref="cabinetTeamRef2">
          <div class="block__grid">

            <img src="@/assets/images/pexels-smuldur-30573089.jpg" alt="Statue de la justice">

            <div class="block__content">
              <h2>Des domaines de compétence diversifiés</h2>
              <p class="block__content__subtitle">
                Nous intervenons dans plusieurs domaines du droit.
              </p>

              <ul>
                <li>Droit de la famille</li>
                <li>Droit des personnes</li>
                <li>Droit pénal</li>
                <li>Droit civil</li>
              </ul>
            </div>
          </div>
        </section>
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
      <!-- MENUS DÉROULANT -->


      <section class="client-support-premium">
        <div class="overlay"></div>

        <div class="client-support-premium__container">
          <h2>Être accompagné à chaque étape</h2>
          <div class="section-line"></div>
          <div class="premium-grid">
            <div class="premium-item">
              <span>01</span>
              <h3>Analyse approfondie</h3>
              <p>Compréhension précise de votre situation et de vos enjeux juridiques.</p>
            </div>

            <div class="premium-item">
              <span>02</span>
              <h3>Stratégie sur mesure</h3>
              <p>Définition d’une approche adaptée à votre dossier et à vos objectifs.</p>
            </div>

            <div class="premium-item">
              <span>03</span>
              <h3>Suivi rigoureux</h3>
              <p>Information claire et régulière jusqu’à la résolution de votre affaire.</p>
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

      <!-- IFRAME -->

      <div class="iframe-container">
        <div class="iframe-container__content">

          <div class="iframe-results">
            <div class="place-card">
              <div class="place-card__media" aria-hidden="true"></div>

              <div class="place-card__body">
                <div class="place-card__title">Cabinet</div>
                <div class="place-card__subtitle">Accès et rendez-vous</div>

                <div class="place-card__line">
                  <span class="dot"></span>
                  <span>Repérez l’emplacement et préparez votre itinéraire.</span>
                </div>

                <div class="place-card__line">
                  <span class="dot"></span>
                  <span>Consultations sur rendez-vous (cabinet ou visio).</span>
                </div>

                <div class="place-card__actions">
                  <a class="btn btn--primary" href="#prendre-rdv">Prendre RDV</a>
                  <a
                    class="btn btn--ghost"
                    href="https://www.google.com/maps/dir/?api=1&destination=18%20Rue%20de%20la%20S%C3%A9r%C3%A9nit%C3%A9%2027000%20%C3%89vreux"
                    target="_blank"
                    rel="noopener"
                  >
                    Itinéraire
                  </a>
                </div>

                <div class="place-card__hint">
                  Les coordonnées complètes sont indiquées plus bas sur la page.
                </div>
              </div>
            </div>

            <div class="place-card place-card--compact">
              <div class="place-card__body">
                <div class="place-card__title">Infos pratiques</div>

                <div class="place-card__chips">
                  <span class="chip">Accès PMR</span>
                  <span class="chip">Parking à proximité</span>
                  <span class="chip">Visio possible</span>
                </div>

                <p class="place-card__text">
                  En cas d’urgence, privilégiez l’appel au cabinet. Pour éviter l’attente,
                  la demande de rendez-vous peut se faire directement via le bouton “Prendre RDV”.
                </p>
              </div>
            </div>
          </div>
        </div>

        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12294.319109934564!2d-0.24133006287153588!3d49.28515163344128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x480a6156d5655ba5%3A0x1eb3a9d9ae79f46a!2sPlage%20de%20Ouistreham!5e0!3m2!1sfr!2sfr!4v1765478462795!5m2!1sfr!2sfr"
          width="400"
          height="300"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Plan d’accès"
        ></iframe>
      </div>

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

.client-support-premium {
  position: relative;
  background: #1f1f1f;
  padding: 120px 20px;
  color: white;
  overflow: hidden;
}

.client-support-premium__container {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
}

.client-support-premium h2 {
  font-size: 38px;
  font-weight: 400;
  letter-spacing: 1px;
}

.section-line {
  width: 60px;
  height: 2px;
  background: #8b9f6f;
  margin: 20px auto 60px auto;
}

.premium-grid {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}

.premium-item {
  flex: 1;
  min-width: 250px;
  text-align: left;
}

.premium-item span {
  font-size: 42px;
  color: #8b9f6f;
  font-weight: bold;
  display: block;
  margin-bottom: 15px;
}

.premium-item h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.premium-item p {
  font-size: 15px;
  line-height: 1.6;
  color: #cccccc;
}


////////
.iframe-container {
  margin: 60px 20px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;


  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(15, 23, 42, 0.10);

  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.10);

  &__content {

    padding: 40px 30px 0 30px;
    background: #faf8f8;
  }

  iframe {
    width: 100%;
    height: 600px;
  }
}

.iframe-head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.iframe-search {
  height: 40px;
  padding: 0 12px;

  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #ffffff;
  outline: none;

  &:focus {
    border-color: rgba(122, 173, 80, 0.9);
    box-shadow: 0 0 0 4px rgba(122, 173, 80, 0.18);
  }
}

.iframe-meta {
  font-size: 13px;
  opacity: 0.7;
  white-space: nowrap;
}

.iframe-results {
  display: grid;
  gap: 14px;
}

.place-card {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 14px;
  padding: 14px;
  border-radius: 12px;
  background: #f8f8fa;
  border: 1px solid rgba(15, 23, 42, 0.08);

  &__media {
    background: linear-gradient(135deg, rgba(122, 173, 80, 0.18), rgba(15, 23, 42, 0.08));
    min-height: 96px;
  }

  &__title {
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.2px;
  }

  &__subtitle {
    font-size: 12px;
    opacity: 0.7;
    margin-top: 2px;
    margin-bottom: 10px;
  }

  &__line {
    display: grid;
    grid-template-columns: 10px 1fr;
    gap: 10px;
    align-items: start;
    font-size: 13px;
    line-height: 1.5;
    opacity: 0.92;
    margin: 6px 0;
  }

  &__actions {
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }

  &__hint {
    font-size: 12px;
    opacity: 0.65;
    margin-top: 10px;
  }

  &--compact {
    grid-template-columns: 1fr;

    .place-card__media {
      display: none;
    }
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 10px 0 8px;
  }

  &__text {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
    opacity: 0.9;
  }
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(122, 173, 80, 0.95);
  margin-top: 6px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 13px;
  text-decoration: none;
  border: 1px solid transparent;

  &--primary {
    background: rgba(122, 173, 80, 1);
    color: #0b1220;
  }

  &--ghost {
    background: #ffffff;
    border-color: rgba(15, 23, 42, 0.14);
    color: rgba(15, 23, 42, 0.9);
  }
}

/* Responsive */
@media (max-width: 980px) {
  .iframe-container {
    grid-template-columns: 1fr;
  }

  .iframe-container iframe {
    height: 360px;
  }

  .place-card {
    grid-template-columns: 1fr;

    &__media {
      min-height: 140px;
    }
  }
}




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

/* ============================= */
/* INTRO SECTION */
/* ============================= */

.intro {
  background: #ffffff;
  padding: 80px 20px 70px 20px;  // top | right | bottom | left
  text-align: center;
  max-width: 1100px;
  margin: 0 auto;

}

/* ============================= */
/* TITRE */
/* ============================= */

.intro h2 {


  font-size: clamp(24px, 2.2vw, 38px);

  font-family: "Playfair Display", serif;

  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--green-page);
  margin-bottom: 14px;


}

/* ============================= */
/* TEXTE PRINCIPAL */
/* ============================= */

.intro__lead {
  font-size: 17px;
  line-height: 1.8;
  color: rgba(15, 23, 42, 0.85);
  margin-bottom: 18px;
}

.intro__small {
  font-size: 16px;
  line-height: 1.75;
  color: rgba(15, 23, 42, 0.75);
  margin-bottom: 18px;
}

/* ============================= */
/* NOMS AVOCATS */
/* ============================= */

.intro__names {
  margin: 24px auto 24px auto;
}

.intro__names p {
  margin: 6px 0;



  font-weight: bold;


}

.intro__names strong {

  color: rgba(15, 23, 42, 0.95);

  font-family: "Playfair Display", serif; /* ou ta serif premium si tu en as une */
  font-weight: 900;
  letter-spacing: 0.01em;

}

/* ============================= */
/* MOBILE */
/* ============================= */

@media (max-width: 991px) {
  .intro {
    padding: 70px 20px 60px;
  }

  .intro h2 {
    font-size: 26px;
  }

  .intro__lead,
  .intro__small {
    font-size: 15px;
  }
}




/*===================
  TEAM / DOMAINES (anti-fade)
===================*/

.sections {
  background: #fff;
}


/* =========================================
   SECTION ÉQUIPE — VERSION PROPRE
   ========================================= */





/* =========================================
   BASE BLOCK
   ========================================= */

.block {
  padding: 5rem 20px;

  &__grid {
    max-width: 2000px; /* Large comme ton hero */
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: center;
  }

  img {
    width: 100%;
    height: 720px;
    border-radius: 12px;
    object-fit: cover;
    display: block;
  }

  &__content {
    max-width: 520px;
    color: #111827;

    h2 {
      margin: 0 0 10px 0;
      font-family: "Playfair Display", serif;
      font-size: clamp(26px, 2.3vw, 34px); /* Légèrement réduit pour harmoniser */
      font-weight: 500;
      letter-spacing: -0.02em;
      color: var(--green-page);
      line-height: 1.15;
    }

    &__subtitle {
      margin: 0 0 30px 0;
      font-size: 15px;
      color: rgba(17, 24, 39, 0.55);
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;

      li {
        position: relative;
        padding: 14px 0 14px 18px;
        font-size: 16px;
        font-weight: 400;
        color: rgba(17, 24, 39, 0.88);
        border-bottom: 1px solid rgba(17, 24, 39, 0.08);
        transition: all 0.2s ease;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 18px;
          background: rgba(17, 24, 39, 0.18);
          border-radius: 2px;
        }

        &:last-child {
          border-bottom: 0;
        }
      }

      /* Avocats légèrement plus marqués UNIQUEMENT si c'est le premier bloc */
      .block--team & li:nth-child(1),
      .block--team & li:nth-child(2) {
        font-weight: 500;
        color: rgba(17, 24, 39, 0.95);
      }
    }
  }
}

/* =========================================
   RESPONSIVE
   ========================================= */

@media (max-width: 1100px) {
  .block {
    &__grid {
      gap: 3rem;
    }

    img {
      height: 560px;
    }
  }
}

@media (max-width: 991px) {
  .block {
    padding: 4rem 20px;

    &__grid {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }

    img {
      height: 420px;
      border-radius: 16px;
    }

    &__content {
      max-width: 100%;
    }
  }
}

@media (max-width: 520px) {
  .block {
    padding: 3rem 16px;

    img {
      height: 320px;
      border-radius: 14px;
    }

    &__content {
      ul li {
        font-size: 15px;
      }
    }
  }
}










/* checks : pas de "✓ " collé, juste un accent sobre */
.checks {
  li {
    position: relative;
    padding-left: 18px;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      width: 6px;
      height: 6px;
      border-radius: 999px;
      transform: translateY(-50%);
      background: var(--green-page);
    }
  }
}

/* responsive */
@media (max-width: 991.98px) {
  .block {
    padding: 3rem 10px;

    &__grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    &__content h2 {
      text-align: center;
      font-size: 24px;
    }

    &__content__subtitle {
      text-align: center;
    }

    &__content ul li {
      text-align: center;
    }
  }
}

@media (max-width: 767.98px) {
  .block {
    padding: 2rem 10px;

    img {
      height: 320px;
    }

    &__content h2 {
      font-size: 20px;
    }

    &__content ul li {
      font-size: 13px;
    }
  }
}

/*===================
  ACCORDIONS
===================*/

.accordion {
  max-width: 1200px;

  margin: 120px auto 100px auto;
  padding: 0 20px;
  @media (max-width: 991.98px) {
    margin: 50px auto;
  }
  @media (max-width: 767.98px) {
    margin: 40px auto;
  }
}

.accordion-item {
  border-bottom: 1px solid black;

  padding: 0 40px;
}

.accordion-header {
  width: 100%;
  background: none;
  border: none;
  padding: 25px 0;
  font-size: 32px;
  color: #8dbf67;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-family: "Playfair Display", serif;
  @media (max-width: 991.98px) {
    font-size: 18px;
  }
  @media (max-width: 767.98px) {
    padding: 20px 0;
    font-size: 16px;
  }
}

.accordion-header .icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: black;


  color: #8dbf67;

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 34px;
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
  //font-size: 15px;
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
  AFFAIRE
===================*/

.case-submit {
  position: relative;

  overflow: hidden;
  margin: 80px 0 0 0;

  height: 550px;
  h2 {
    font-size: 42px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  p {
    font-size: 16px;
    line-height: 1.6;
    max-width: 680px;
    margin: 0 auto 28px auto;
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
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    background: #ffffff;
    color: #000;
    padding: 12px 28px;
    border-radius: 30px;
    transition: all 0.2s ease;
  }
  &__cta:hover {
    background: #6BAA75;
    color: #ffffff;
    transform: translateY(-2px);
  }
}

@media (max-width: 991.98px) {
  .case-submit {
    margin: 0 20px 0 20px;
  }
}

@media (max-width: 767.98px) {
  .case-submit {
    height: 340px;
    margin: 20px 0 0 0;
    border-radius: 0;
    h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    p {
      font-size: 15px;
      margin: 0 auto 24px auto;
    }
    &__cta {
      font-size: 12px;
    }
  }
}

/*===================
  CONTACT
===================*/

.contact-quick {
  background: #ffffff;
  padding: 140px 60px;
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
