<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";

type Template = {
  publicId: string;
  name: string;
  messageType: string;
  body: string;
  createdAt: string;
};

const templates = ref<Template[]>([]);
const name = ref("");
const messageType = ref("TRANSACTIONAL");
const body = ref("Dear {{name}}, …");
const error = ref("");
const notice = ref("");

async function load() {
  templates.value = await api("/api/v1/templates");
}

async function save() {
  error.value = "";
  notice.value = "";
  try {
    await api("/api/v1/templates", {
      method: "POST",
      body: JSON.stringify({ name: name.value, messageType: messageType.value, body: body.value })
    });
    notice.value = "Template saved";
    name.value = "";
    body.value = "Dear {{name}}, …";
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not save template";
  }
}

async function remove(id: string) {
  error.value = "";
  try {
    await api(`/api/v1/templates/${id}`, { method: "DELETE" });
    notice.value = "Template deleted";
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Delete failed";
  }
}

onMounted(() => load().catch((err) => (error.value = err.message)));
</script>

<template>
  <h1>Templates</h1>
  <p class="muted">Reusable message bodies with <code v-pre>{{name}}</code>-style placeholders for campaigns.</p>

  <form class="card stack" @submit.prevent="save">
    <label>Name <input v-model="name" required /></label>
    <label>Type
      <select v-model="messageType">
        <option value="TRANSACTIONAL">TRANSACTIONAL</option>
        <option value="MARKETING">MARKETING</option>
        <option value="OTP">OTP</option>
      </select>
    </label>
    <label>Body <textarea v-model="body" rows="4" required /></label>
    <p v-if="notice" class="muted">{{ notice }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <button type="submit">Save template</button>
  </form>

  <table style="margin-top: 1rem">
    <thead><tr><th>Name</th><th>Type</th><th>Body</th><th></th></tr></thead>
    <tbody>
      <tr v-if="templates.length === 0"><td colspan="4" class="muted">No saved templates yet</td></tr>
      <tr v-for="item in templates" :key="item.publicId">
        <td>{{ item.name }}</td>
        <td>{{ item.messageType }}</td>
        <td><code>{{ item.body }}</code></td>
        <td><button class="ghost" type="button" @click="remove(item.publicId)">Delete</button></td>
      </tr>
    </tbody>
  </table>
</template>
