<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSession } from "../stores/session";

const email = ref("admin@chambaka.co.tz");
const password = ref("changeme");
const error = ref("");
const session = useSession();
const router = useRouter();

async function submit() {
  error.value = "";
  try {
    await session.login(email.value, password.value);
    await router.push("/");
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Login failed";
  }
}
</script>

<template>
  <div class="login">
    <form class="card stack" @submit.prevent="submit">
      <h1>Chambaka SMS</h1>
      <p class="muted">Sign in to the bulk portal. The pilot admin is created on first API start.</p>
      <label>Email <input v-model="email" type="email" required /></label>
      <label>Password <input v-model="password" type="password" required /></label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit">Sign in</button>
    </form>
  </div>
</template>
