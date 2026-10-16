<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";

const keys = ref<any[]>([]);
const hooks = ref<any[]>([]);
const url = ref("https://example.com/sms");
const fresh = ref("");
const error = ref("");

async function load() {
  keys.value = await api("/api/v1/api-keys");
  hooks.value = await api("/api/v1/webhooks");
}

async function issue() {
  error.value = "";
  try {
    const created = await api<{ token: string }>("/api/v1/api-keys", { method: "POST", body: "{}" });
    fresh.value = created.token;
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not issue a key";
  }
}

async function addHook() {
  error.value = "";
  try {
    hooks.value = await api("/api/v1/webhooks", { method: "POST", body: JSON.stringify({ url: url.value }) });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Webhook rejected";
  }
}

onMounted(() => load().catch((err) => (error.value = err.message)));
</script>

<template>
  <h1>Developers</h1>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="fresh" class="card">New key, shown once: <strong>{{ fresh }}</strong></p>
  <p><button @click="issue">Issue API key</button></p>
  <table>
    <thead><tr><th>Prefix</th><th>Application</th><th>Revoked</th></tr></thead>
    <tbody><tr v-for="item in keys" :key="item.prefix"><td>{{ item.prefix }}</td><td>{{ item.applicationName }}</td><td>{{ item.revoked }}</td></tr></tbody>
  </table>
  <form class="card stack" style="margin-top: 1rem" @submit.prevent="addHook">
    <label>Webhook URL <input v-model="url" /></label>
    <button type="submit">Save webhook</button>
  </form>
  <ul>
    <li v-for="hook in hooks" :key="hook.id">{{ hook.url }} · {{ hook.status }}</li>
  </ul>
</template>
