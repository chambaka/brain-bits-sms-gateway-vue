<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";

const wallet = ref<{ availableTzs: number; reservedTzs: number } | null>(null);
const usage = ref<{ delivered: number; failed: number; inflight: number; total: number } | null>(null);
const error = ref("");

onMounted(async () => {
  try {
    wallet.value = await api("/api/v1/wallet");
    usage.value = await api("/api/v1/usage");
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not load dashboard";
  }
});
</script>

<template>
  <h1>Today</h1>
  <p v-if="error" class="error">{{ error }}</p>
  <div class="grid">
    <article class="card"><div class="muted">Available</div><div class="metric">{{ wallet?.availableTzs ?? "—" }} TZS</div></article>
    <article class="card"><div class="muted">Reserved</div><div class="metric">{{ wallet?.reservedTzs ?? "—" }} TZS</div></article>
    <article class="card"><div class="muted">Delivered</div><div class="metric">{{ usage?.delivered ?? "—" }}</div></article>
    <article class="card"><div class="muted">In flight</div><div class="metric">{{ usage?.inflight ?? "—" }}</div></article>
    <article class="card"><div class="muted">Failed</div><div class="metric">{{ usage?.failed ?? "—" }}</div></article>
  </div>
</template>
