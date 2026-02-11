<script setup lang="ts">
import AlertMessage from "@/templates/alert-message/AlertMessage.vue";
import { computed, nextTick, onMounted, ref } from "vue";
import { useBookingStore } from "@/stores/bookingStore.ts";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { gsap } from "gsap";
import * as z from "zod";

import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/*===============
  BOOKING DATE
===============*/

const bookingStore = useBookingStore();

const errorDatetime = ref<string | null>(null);
const dateBooking = ref<string | null>(null);

dateBooking.value = bookingStore.bookingDraft.datetime;

const formattedDate = computed(() => {
  const value = bookingStore.bookingDraft.datetime;

  if (!bookingStore.bookingDraft.datetime) return "";

  const date = new Date(value);

  return new Intl.DateTimeFormat("fr-Fr", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris", // 🔥 LA CLÉ
  }).format(date);
});

/*===============
  BOOKING VEE-VALIDATE
===============*/

const schema = z.object({
  firstname: z
    .string({ message: "⚠️ Veuillez renseigner votre prénom." })
    .min(3, { message: "⚠️ Votre prénom doit contenir au moins 3 caractères." })
    .max(100, { message: "⚠️ Votre prénom est un peu long (100 caractères max)." }),
  lastname: z
    .string({ message: "⚠️ Veuillez renseigner votre nom de famille." })
    .min(3, { message: "⚠️ Votre nom doit contenir au moins 3 caractères." })
    .max(100, { message: "⚠️ Votre nom est un peu long (100 caractères max)." }),
  email: z
    .string({ message: "⚠️ Veuillez saisir votre adresse e-mail." })
    .email({ message: "⚠️ Merci d’indiquer une adresse e-mail valide (ex. nom@exemple.fr)." }),
  phone: z
    .string({ message: "⚠️ Veuillez indiquer votre numéro de téléphone." })
    .regex(/^(\+33|0)[1-9]\d{8}$/, {
      message: "⚠️ Merci de saisir un numéro de téléphone français valide (ex. 06 12 34 56 78).",
    }),
});

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(schema),
});

const { value: firstname, errorMessage: errorFirstname } = useField<string>("firstname");
const { value: lastname, errorMessage: errorLastname } = useField<string>("lastname");
const { value: email, errorMessage: errorEmail } = useField<string>("email");
const { value: phone, errorMessage: errorPhone } = useField<string>("phone");

const onSubmit = handleSubmit(async (data, { resetForm }) => {
  const datetimeStr = bookingStore.bookingDraft.datetime;

  if (!datetimeStr) {
    errorDatetime.value = "Veuillez sélectionner un créneau.";
    return;
  }

  const selectedDate = new Date(datetimeStr);
  const now = new Date();

  // 🔒 Sécurité finale (logique backend)
  if (selectedDate <= now) {
    errorDatetime.value = "Ce créneau est déjà passé. Veuillez sélectionner une date valide.";
    return;
  }

  try {
    const dataBooking = {
      datetime: selectedDate.toISOString(), // ✅ ISO ICI SEULEMENT
      service_id: bookingStore.bookingDraft.serviceId,
      staff_id: bookingStore.bookingDraft.staffId,
      category_id: bookingStore.bookingDraft.categoryId,
      ...data,
    };

    await bookingStore.createBooking(dataBooking);

    setSuccessMessage(`Votre rendez-vous a été enregistré avec succès. ✨`, resetForm);
  } catch (e: any) {
    const apiError = e?.response?.data;

    if (apiError?.type === "DATETIME_ALREADY_TAKEN") {
      setErrorMessage(apiError.message);
      return;
    }

    setErrorMessage("Une erreur est survenue, veuillez réessayer.");
  }
});

/*===============
  FORMULAIRE GESTION DES ERREURS
===============*/

let reset = () => {};

const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const errorDate = ref<string | null>(null);

function setSuccessMessage(msg: string, resetForm: () => void) {
  successMessage.value = msg;
  errorMessage.value = null;
  errorDate.value = null;
  errorDatetime.value = null;
  reset = resetForm;
}

function setErrorMessage(msg: string) {
  successMessage.value = null;
  errorDate.value = msg;
}

function closeFields() {
  successMessage.value = null;
  errorMessage.value = null;
  errorDate.value = null;
  errorDatetime.value = null;
}

function handleResetForm() {
  closeFields();
  reset();
}

/*===============
  FORM, TITLE, ANIMATIONS GSAP
===============*/

const bookingFormRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  await nextTick();

  gsap.from(bookingFormRef.value, {
    opacity: 0,
    y: 10,
    duration: 0.6,
  });
});
</script>

<template>
  <div class="page">
    <div class="container" ref="bookingFormRef">
      <div class="booking">
        <!-- Booking date -->
        <div class="booking__date">
          <p class="date">📅 {{ formattedDate }}</p>
        </div>
        <!-- Booking form -->
        <div class="booking__form">
          <h2>Finaliser votre rendez-vous</h2>
          <form @submit.prevent="onSubmit">
            <div class="form-group">
              <input v-model="firstname" type="text" placeholder="Prénom" />
              <span v-if="errorFirstname" class="error-field">
            {{ errorFirstname }}
          </span>
            </div>
            <div class="form-group">
              <input v-model="lastname" type="text" placeholder="Nom" />
              <span v-if="errorLastname" class="error-field">
            {{ errorLastname }}
          </span>
            </div>
            <div class="form-group">
              <input v-model="email" type="email" placeholder="Email" />
              <span v-if="errorEmail" class="error-field">
            {{ errorEmail }}
          </span>
            </div>
            <div class="form-group">
              <input v-model="phone" type="tel" placeholder="Téléphone" />
              <span v-if="errorPhone" class="error-field">{{ errorPhone }}</span>
            </div>
            <AlertMessage
              v-if="successMessage"
              :successMessage="successMessage"
              type="success"
              to="/confirmation"
              class="alert"
              @close="handleResetForm()"
            />
            <AlertMessage
              v-if="errorMessage"
              :errorMessage="errorMessage"
              type="error"
              to=""
              class="alert"
              @close="closeFields()"
            />
            <AlertMessage
              v-if="errorDate"
              :errorMessage="errorDate"
              type="error"
              to=""
              class="alert"
              @close="closeFields()"
            />
            <button class="btn btn-submit" :disabled="isSubmitting">
              <span v-if="isSubmitting">Envoi en cours…</span>
              <span v-else>Confirmer le rendez-vous</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

/*===============
  BOOKING
===============*/



/*===============
  BOOKING DATE
===============*/

.booking__date {
  margin: 0 auto 0 auto;
  text-align: center;
  width: 240px;
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
  gap: 6px;
  background: #D7EAF2;
  border: 1px solid #BFD6E2;
  color: #1F2937;
  @media (max-width: 991.98px) {
    margin: 10px auto 0 auto;
    padding: 8px;
  }
  @media (max-width: 767.98px) {
    margin: 10px auto 0 auto;
    padding: 7px;
  }
  .date {
    font-size: 13px;
    @media (max-width: 991.98px) {
     font-size: 13px;
    }
    @media (max-width: 767.98px) {
      font-size: 12px;
    }
  }
}



/*===============
  BOOKING FORM
 ===============*/

.booking__form {
  margin: 40px 0 20px 0;
  padding: 30px 20px 15px 20px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  text-align: center;
  width: 480px;
  h2 {
    font-size: 18px;
    color: #5a4e6a;
    font-family: "Playfair Display", serif;
    margin-bottom: 20px;
  }
  .form-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 16px;
    .error-field {
      font-size: 11px;
      color: var(--error-field);
    }
    .inputs-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    input {
      width: 100%;
      font-size: 12px;
      border-radius: 12px;
      border: 1px solid #ddd;
      background: #f9fafb;
      padding: 14px;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background-color 0.2s ease;
    }
    textarea {
      min-height: 90px;
      resize: none;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background-color 0.2s ease;
    }
    textarea::placeholder {
      font-size: 13px;
    }
  }
  input:focus,
  .booking__form textarea:focus {
    outline: none;
    border-color: #d3aeff;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(211, 174, 255, 0.35);
  }
  .btn {
    margin-top: 10px;
    background: #D7EAF2;
    border: 1px solid #BFD6E2;
    color: #6b6d78;
    padding: 14px;
    font-size: 11px;
  }
  .alert {
    margin-top: 10px;
    font-size: 14px;
  }
}

@media (max-width: 991.98px) {
  .booking__form {
    h2 {
      font-size: 17px;
      font-family: "Playfair Display", serif;
      margin-bottom: 22px;
    }
    .form-group {
      margin-top: 16px;
      .error-field {
        font-size: 11px;
        padding-left: 4px;
      }
    }
    .btn {
      padding: 12px;
    }
  }
}

@media (max-width: 767.98px) {
  .booking__form {

    width: 100%;
    h2 {
      font-size: 14px;
      font-family: "Playfair Display", serif;
      margin-bottom: 15px;
    }
    .form-group {
      margin-top: 13px;
      .error-field {
        font-size: 9px;
        padding-left: 2px;
        margin-left: 3px;
      }
    }
    .btn {
      font-size: 10px;
      padding: 10px;
    }
    .form-group input {
      font-size: 13px;
      padding: 13px 10px;
    }
    .form-group input::placeholder {
      font-size: 11px;
    }
  }
}
</style>
