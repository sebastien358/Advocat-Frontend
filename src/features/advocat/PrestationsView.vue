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
      <section id="hero" class="hero">
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
      <section id="cabinet-intro" class="intro">
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

      <section id="equipe" class="sections">
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
        <section id="expertises" class="block block--domains">
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
          <span class="engagements-quality__surtitle">Avocats à Évreux et Louviers</span>
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
          <span class="case-submit__subtitle">Avocats à Évreux et Louviers</span>
          <h2>Une affaire à soumettre<br>à notre cabinet&nbsp;?</h2>
          <p>
            L’accueil téléphonique de Maître Evelyne Boyer est ouvert
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
              1 Rue du Jardin Botanique<br />
              27000 Évreux
            </p>
          </div>

          <div class="contact-quick__item">
            <div class="contact-quick__icon">📞</div>
            <h4>Téléphone</h4>
            <p>02 32 62 80 01</p>
          </div>

          <div class="contact-quick__item">
            <div class="contact-quick__icon">✉️</div>
            <h4>E-mail</h4>
            <p>evreux@avocatsbhb.fr</p>
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
  margin: 4rem auto 4rem auto;
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
    font-size: 19px;
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
@media (max-width: 991.98px) {
  .block {
    padding: 5rem 10px;
    &__grid {
      grid-template-columns: 1fr;
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
    padding: 3rem 10px;
    &__grid {
      grid-template-columns: 1fr;
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
  h2 {
    margin-bottom: 40px;
  }
  &__grid {
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
}

/*===================
  ACCORDIONS
===================*/

.accordion {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
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

/*===================
  ENGAGEMENTS QUALITY
===================*/

.engagements-quality {
  background: #ffffff;
  padding: 80px 24px;
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

@media (max-width: 640px) {
  .engagements-quality__grid {
    grid-template-columns: 1fr;
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
}

.case-submit__bg {
  position: absolute;
  inset: 0;
}

.case-submit__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.case-submit__bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.case-submit__content {
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

.case-submit__subtitle {
  font-size: 14px;
  letter-spacing: 1px;
  opacity: 0.85;
  margin-bottom: 12px;
}

.case-submit h2 {
  font-size: 42px;
  font-weight: 600;
  margin-bottom: 20px;
}

.case-submit p {
  font-size: 16px;
  line-height: 1.6;
  max-width: 680px;
  margin: 0 auto 28px;
  opacity: 0.95;
}

.case-submit__cta {
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

.case-submit__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

/*===================
  CONTACT
===================*/


.contact-quick {
  background: #ffffff;
  padding: 80px 60px;
}

.contact-quick__container {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  text-align: center;
}

.contact-quick__item h4 {
  margin: 12px 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #7da85a; /* ton vert */
}

.contact-quick__item p {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.contact-quick__icon {
  font-size: 28px;
  margin-bottom: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .contact-quick__container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}






/*===================
  SCROLL TOP
===================*/

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
