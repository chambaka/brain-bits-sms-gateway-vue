<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";

type Member = { publicId: string; email: string; displayName: string; status: string };

const members = ref<Member[]>([]);
const email = ref("");
const password = ref("");
const displayName = ref("");
const role = ref("DEVELOPER");
const error = ref("");
const notice = ref("");

async function load() {
  members.value = await api("/api/v1/team");
}

async function invite() {
  error.value = "";
  notice.value = "";
  try {
    await api("/api/v1/team", {
      method: "POST",
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        displayName: displayName.value,
        role: role.value
      })
    });
    notice.value = `Invited ${email.value}`;
    email.value = "";
    password.value = "";
    displayName.value = "";
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Invite failed";
  }
}

onMounted(() => load().catch((err) => (error.value = err.message)));
</script>

<template>
  <h1>Team</h1>
  <p class="muted">Invite colleagues. Requires <code>CUSTOMER_ADMIN</code> or <code>SUPER_ADMIN</code>.</p>

  <form class="card stack" @submit.prevent="invite">
    <label>Email <input v-model="email" type="email" required /></label>
    <label>Display name <input v-model="displayName" required /></label>
    <label>Temporary password <input v-model="password" type="password" required minlength="8" /></label>
    <label>Role
      <select v-model="role">
        <option value="CUSTOMER_ADMIN">CUSTOMER_ADMIN</option>
        <option value="DEVELOPER">DEVELOPER</option>
        <option value="CAMPAIGN_MANAGER">CAMPAIGN_MANAGER</option>
      </select>
    </label>
    <p v-if="notice" class="muted">{{ notice }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <button type="submit">Invite member</button>
  </form>

  <table style="margin-top: 1rem">
    <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
    <tbody>
      <tr v-for="item in members" :key="item.publicId">
        <td>{{ item.displayName }}</td>
        <td>{{ item.email }}</td>
        <td>{{ item.status }}</td>
      </tr>
    </tbody>
  </table>
</template>
