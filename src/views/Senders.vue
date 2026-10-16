<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";

const senders = ref<any[]>([]);
const senderName = ref("");
const purpose = ref("TRANSACTIONAL");
const error = ref("");

async function load() {
  senders.value = await api("/api/v1/sender-ids");
}

async function requestSender() {
  error.value = "";
  try {
    await api("/api/v1/sender-ids", { method: "POST", body: JSON.stringify({ senderName: senderName.value, purpose: purpose.value }) });
    senderName.value = "";
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Request failed";
  }
}

onMounted(() => load().catch((err) => (error.value = err.message)));
</script>

<template>
  <h1>Sender IDs</h1>
  <form class="card stack" @submit.prevent="requestSender">
    <label>Name <input v-model="senderName" maxlength="11" required /></label>
    <label>Purpose <input v-model="purpose" /></label>
    <p v-if="error" class="error">{{ error }}</p>
    <button type="submit">Request approval</button>
  </form>
  <table style="margin-top: 1rem">
    <thead><tr><th>Sender</th><th>Purpose</th><th>Status</th></tr></thead>
    <tbody>
      <tr v-for="item in senders" :key="item.id"><td>{{ item.senderName }}</td><td>{{ item.purpose }}</td><td>{{ item.status }}</td></tr>
    </tbody>
  </table>
</template>
