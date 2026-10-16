<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";

type Payment = {
  publicId: string;
  amountTzs: number;
  method: string;
  status: string;
  createdAt: string;
};

const wallet = ref<{ availableTzs: number; reservedTzs: number } | null>(null);
const entries = ref<any[]>([]);
const payments = ref<Payment[]>([]);
const amount = ref(10000);
const error = ref("");
const notice = ref("");

async function load() {
  wallet.value = await api("/api/v1/wallet");
  entries.value = await api("/api/v1/wallet/transactions");
  payments.value = await api("/api/v1/payment-intents");
}

async function topUp() {
  error.value = "";
  notice.value = "";
  try {
    const payment = await api<Payment>("/api/v1/payment-intents", {
      method: "POST",
      body: JSON.stringify({ amountTzs: amount.value, method: "MANUAL" })
    });
    notice.value = `Payment ${payment.publicId} is pending. A finance admin confirms it on Admin → Payments.`;
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Top-up failed";
  }
}

onMounted(() => load().catch((err) => (error.value = err.message)));
</script>

<template>
  <h1>Wallet</h1>
  <div class="grid">
    <article class="card"><div class="muted">Available</div><div class="metric">{{ wallet?.availableTzs ?? "—" }} TZS</div></article>
    <article class="card"><div class="muted">Reserved</div><div class="metric">{{ wallet?.reservedTzs ?? "—" }} TZS</div></article>
  </div>
  <form class="card stack" style="margin-top: 1rem" @submit.prevent="topUp">
    <label>Manual top-up (TZS) <input v-model.number="amount" type="number" min="1" /></label>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="notice" class="muted">{{ notice }}</p>
    <button type="submit">Create payment intent</button>
  </form>

  <h2>Payment intents</h2>
  <table>
    <thead><tr><th>ID</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead>
    <tbody>
      <tr v-if="payments.length === 0"><td colspan="4" class="muted">No payment intents yet</td></tr>
      <tr v-for="item in payments" :key="item.publicId">
        <td><code>{{ item.publicId }}</code></td>
        <td>{{ item.amountTzs }} TZS</td>
        <td>{{ item.status }}</td>
        <td>{{ item.createdAt ? new Date(item.createdAt).toLocaleString() : "—" }}</td>
      </tr>
    </tbody>
  </table>

  <h2>Ledger</h2>
  <table>
    <thead><tr><th>Type</th><th>Available</th><th>Reserved</th><th>Note</th></tr></thead>
    <tbody>
      <tr v-for="(entry, index) in entries" :key="index">
        <td>{{ entry.entryType }}</td><td>{{ entry.availableDelta }}</td><td>{{ entry.reservedDelta }}</td><td>{{ entry.description }}</td>
      </tr>
    </tbody>
  </table>
</template>
