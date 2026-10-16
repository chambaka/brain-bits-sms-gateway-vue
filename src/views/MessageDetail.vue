<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { api } from "../api";

const route = useRoute();
const message = ref<any>(null);
const error = ref("");

onMounted(async () => {
  try {
    message.value = await api(`/api/v1/messages/${route.params.id}`);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Not found";
  }
});
</script>

<template>
  <h1>Message</h1>
  <p v-if="error" class="error">{{ error }}</p>
  <article v-if="message" class="card stack">
    <div><span class="muted">Status</span> {{ message.status }}</div>
    <div><span class="muted">To</span> {{ message.destination }}</div>
    <div><span class="muted">Reserved</span> {{ message.reservedAmount }} TZS</div>
    <p>{{ message.body }}</p>
  </article>
</template>
