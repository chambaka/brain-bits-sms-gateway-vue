<script setup lang="ts">
import { useRouter } from "vue-router";
import { useSession } from "../stores/session";

const session = useSession();
const router = useRouter();

function logout() {
  session.logout();
  router.push("/login");
}
</script>

<template>
  <div class="shell">
    <nav>
      <p class="brand">Chambaka</p>
      <router-link to="/">Dashboard</router-link>
      <router-link to="/messages">Messages</router-link>
      <router-link to="/campaigns">Campaigns</router-link>
      <router-link to="/contacts">Contacts</router-link>
      <router-link to="/sender-ids">Sender IDs</router-link>
      <router-link to="/templates">Templates</router-link>
      <router-link to="/team">Team</router-link>
      <router-link to="/developers/api-keys">Developers</router-link>
      <router-link to="/billing/wallet">Wallet</router-link>
      <router-link to="/billing/invoices">Invoices</router-link>
      <router-link to="/admin/organizations">Admin</router-link>
      <button class="ghost" style="margin-top: auto" @click="logout">Sign out</button>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>
