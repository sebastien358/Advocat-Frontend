<script setup lang="ts">
import { useContactAdminStore } from "@/stores/admin/contactAdminStore.ts";
import { useBookingAdminStore } from "@/stores/admin/bookingAdminStore.ts";
import { useStaffAdminStore } from "@/stores/admin/staffAdminStore.ts";
import { useServiceAdminStore } from "@/stores/admin/serviceAdminStore.ts";
import { useTestimonialAdminStore } from "@/stores/admin/testimonialAdminStore.ts";

import { useRouter } from "vue-router";

const contactAdminStore = useContactAdminStore();
const bookingAdminStore = useBookingAdminStore();
const staffAdminStore = useStaffAdminStore();
const serviceAdminStore = useServiceAdminStore();
const testimonialAdminStore = useTestimonialAdminStore();

const router = useRouter();

const props = defineProps<{
  showModal: boolean;
  contactId: number;
  testimonialId: number;
  appointmentId: number;
  serviceId: number;
  staffId: number;
  imageId: number | null;
  textModal: string;
  type: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

function closeModal() {
  emit("close");
}

/*=====================
  SUPRESSION D'UN MESSAGE OU D'UN TÉMOIGNAGE
=====================*/

async function deleteElement() {
  try {
    if (props.type === "contact") {
      await contactAdminStore.deleteAdminContact(props.contactId);
      await router.push({ path: "/contact/list" });
    }
    if (props.type === "appointment") {
      await bookingAdminStore.bookingAdminDelete(props.appointmentId);
      await router.push({ path: "/booking/list" });
    }
    if (props.type === "staff") {
      await staffAdminStore.deleteStaff(props.staffId, props.imageId ?? undefined);
      await router.push({ path: "/staff/list" });
    }
    if (props.type === "service") {
      await serviceAdminStore.deleteService(props.serviceId);
      await router.push({ path: "/service/list" });
    }
    if (props.type === "testimonial") {
      await testimonialAdminStore.testimonialDelete(
        props.testimonialId,
        props.imageId ?? undefined,
      );
      await router.push({ path: "/testimonial/list" });
    }
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <Teleport v-if="showModal" to="body">
    <div class="modal">
      <div class="modal__content">
        <h3>{{ textModal }}</h3>
        <p>Cette action est définitive. Le témoignage sera effacé du site.</p>
        <div class="btn-modal-list">
          <button @click="closeModal()" class="btn btn-modal-cancel">Annuler</button>
          <button @click="deleteElement()" class="btn btn-modal-delete">Supprimer</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
$modalBg: #2c2f4a;
$modalBorder: #6e66ff;
$modalText: #e9ebff;

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.84);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  &__content {
    background-color: white;
    box-shadow: 0 12px 50px rgba(110, 102, 255, 0.45);
    height: auto;
    width: 100%;
    max-width: 500px;
    border-radius: 12px;
    padding: 30px;
    @media (max-width: 996.98px) {
      padding: 20px 25px;
      font-size: 13px;
    }
    @media (max-width: 576.98px) {
      padding: 20px 25px;
      font-size: 11px;
    }
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111; // noir presque pur
      margin-bottom: 6px;
    }
    p {
      font-size: 14px;
      color: #6b7280; // gris neutre (slate / gray)
      line-height: 1.5;
      margin: 0 0 16px 0;
    }
    .btn-modal-list {
      display: flex;
      align-items: center;
      margin-top: 7px;
      gap: 10px;
      @media (max-width: 576.98px) {
        margin-top: 3px;
      }
      .btn-modal-cancel {
        padding: 9px;
        width: 90px;
        border-radius: 3px;
        background: gray;
        font-size: 12px;
        background: #e5e7eb;
        color: #111;
        &:hover {
          background: #d1d5db;
        }
      }
      .btn-modal-delete {
        padding: 9px;
        width: 90px;
        border-radius: 3px;
        font-size: 12px;
        background: #dc2626; // rouge moderne (type Tailwind red-600)
        color: #fff;
        &:hover {
          background: #b91c1c;
        }
      }
    }
  }
}
</style>
