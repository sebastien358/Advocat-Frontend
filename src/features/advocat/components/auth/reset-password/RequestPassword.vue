<script setup lang="ts">
import { onMounted, ref } from 'vue'
import gsap from 'gsap'

const requestRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (requestRef.value) {
    gsap.from(requestRef.value, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out'
    })
  }
})
</script>

<template>
  <section class="request-password-grid container">
    <!-- FORM -->
    <div class="request-password-form" ref="requestRef">
      <h1 class="request-password-title">Réinitialiser votre mot de passe</h1>
      <p class="request-password-subtitle">Renseignez votre email pour recevoir le lien de réinitialisation.</p>
      <form>
        <div class="form-group">
          <input type="email" placeholder="Email" />
        </div>
        <div class="info-hint">
          <span>Vous recevrez un lien pour réinitialiser votre mot de passe.</span>
        </div>
        <div class="btn-wrapper">
          <button class="btn-primary full">Envoyer le lien</button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
/*===============
  CONTAINER
===============*/

.container {
  padding: 30px 20px 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/*===============
  REQUEST PASSWORD FORM
===============*/

.request-password-form {
  background: #fff;
  border-radius: 18px;
  padding: 22px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  .request-password-title {
    text-align: center;
    margin-bottom: 8px;
    letter-spacing: 0.2px;
    font-size: 25px;
    font-weight: 700;
  }
  .request-password-subtitle {
    font-size: 14px;
    margin-bottom: 24px;
    text-align: center;
    font-style: italic;
    line-height: 1.4;
    opacity: 0.7;
  }
  .form-group {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: 15px;
  }
  .info-hint {
    margin-top: 3px;
    text-align: center;

    span {
      font-size: 11px;
      font-style: italic;
      opacity: 0.6;
      line-height: 1.4;
      color: #A8A8A8;
    }
  }
}

.inputs-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.request-password-form input,
.request-password-form textarea {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #ddd;
  font-size: 15px;
  background: #fafafa;
}

.request-password-form textarea {
  min-height: 90px;
  resize: none;
}

.btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  button {
    margin-top: 12px;
    text-align: center;
  }
}

.request-password-form input:focus,
.request-password-form textarea:focus {
  border-color: #d6b36a;
  outline: none;
  background: #fffdf8;
}
</style>
