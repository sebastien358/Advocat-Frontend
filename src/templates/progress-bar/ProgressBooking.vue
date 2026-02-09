<script setup lang="ts">

defineProps<{
  progress: number
}>()
</script>

<template>
  <section class="booking-progress">
    <div class="separator-progress-left" :class="{active: $props.progress >= 1}"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :class="{active: $props.progress >= 1}">
      <rect x="3" y="4" width="18" height="4" rx="2" fill="#6FAFB3"/>
      <rect x="3" y="10" width="12" height="4" rx="2" fill="#CFE6E8"/>
      <rect x="3" y="16" width="8" height="4" rx="2" fill="#CFE6E8"/>
    </svg>
    <div class="separator-progress" :class="{active: $props.progress === 2}"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :class="{active: $props.progress === 2}">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#6FAFB3" stroke-width="2"/>
      <line x1="3" y1="9" x2="21" y2="9" stroke="#6FAFB3" stroke-width="2"/>
      <rect x="7" y="12" width="4" height="4" rx="1" fill="#6FAFB3"/>
    </svg>


    <div class="separator-progress"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <!-- feuille -->
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="#6FAFB3"
        stroke-width="2"
      />
      <!-- lignes de texte -->
      <line x1="8" y1="8" x2="16" y2="8" stroke="#6FAFB3" stroke-width="2" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="#6FAFB3" stroke-width="2" />
      <!-- champ / checkbox -->
      <rect
        x="8"
        y="15"
        width="4"
        height="4"
        rx="1"
        stroke="#6FAFB3"
        stroke-width="2"
      />
    </svg>



    <div class="separator-progress"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#6FAFB3" stroke-width="2"/>
      <path d="M7 12l3 3 7-7" stroke="#6FAFB3" stroke-width="2" fill="none"/>
    </svg>
    <div class="separator-progress-right"></div>
  </section>
</template>

<style scoped lang="scss">

.booking-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 25px 0 35px;
  width: 100%;
  .separator-progress-left,
  .separator-progress-right {
    width: 20px;
    height: 2px;
    background: #f1f2f6;
  }

  .separator-progress-left.active {
    background: #5FA3A8;
  }


  .separator-progress {
    width: 40px;
    height: 2px;
    background: #f1f2f6;
  }

  .separator-progress.active {
    background: linear-gradient(
        to right,
        #5FA3A8,
        #3C7F84
    );
  }


  svg {
    background: #f1f2f6;
    padding: 6px;
    border-radius: 50%;
    height: 33px;
    width: 33px;
  }
  svg.active {
    border: 1px solid #5FA3A8;
    box-shadow: inset 0 0 0 1px rgba(95, 163, 168, 0.9);
  }
}

</style>
