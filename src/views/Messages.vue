<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";

const items = ref<any[]>([]);
const to = ref("0712345678");
const senderId = ref("CHAMBAKA");
const message = ref("Malipo yako yamepokelewa. Asante!");
const error = ref("");

async function load() {
  const data = await api<{ items: any[] }>("/api/v1/messages");
  items.value = data.items;
}

async function send() {
  error.value = "";
  try {
    await api("/api/v1/messages", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ to: to.value, senderId: senderId.value, message: message.value, type: "TRANSACTIONAL" })
    });
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Send failed";
  }
}

onMounted(() => load().catch((err) => (error.value = err.message)));
</script>

<template>
  <h1>Messages</h1>
  <form class="card stack" @submit.prevent="send">
    <label>To <input v-model="to" /></label>
    <label>Sender ID <input v-model="senderId" /></label>
    <label>Message <textarea v-model="message" rows="3" /></label>
    <p v-if="error" class="error">{{ error }}</p>
    <button type="submit">Queue SMS</button>
  </form>
  <table style="margin-top: 1rem">
    <thead><tr><th>To</th><th>Status</th><th>Segments</th><th></th></tr></thead>
    <tbody>
      <tr v-for="item in items" :key="item.publicId">
        <td>{{ item.destination }}</td>
        <td>{{ item.status }}</td>
        <td>{{ item.segmentCount }}</td>
        <td><a :href="`/messages/${item.publicId}`">Open</a></td>
      </tr>
    </tbody>
  </table>
</template>
