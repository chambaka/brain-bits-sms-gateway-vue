<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";

type Invoice = {
  publicId: string;
  amountTzs: number;
  method: string;
  status: string;
  createdAt: string;
  confirmedAt: string | null;
};

const invoices = ref<Invoice[]>([]);
const error = ref("");

async function load() {
  invoices.value = await api("/api/v1/invoices");
}

onMounted(() => load().catch((err) => (error.value = err.message)));
</script>

<template>
  <h1>Invoices</h1>
  <p class="muted">Confirmed top-ups for this organization. Pending intents stay on the Wallet screen until a finance admin confirms them.</p>
  <p v-if="error" class="error">{{ error }}</p>

  <table>
    <thead>
      <tr>
        <th>Invoice</th>
        <th>Amount</th>
        <th>Method</th>
        <th>Created</th>
        <th>Confirmed</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="invoices.length === 0"><td colspan="5" class="muted">No confirmed top-ups yet</td></tr>
      <tr v-for="item in invoices" :key="item.publicId">
        <td><code>{{ item.publicId }}</code></td>
        <td>{{ item.amountTzs }} TZS</td>
        <td>{{ item.method }}</td>
        <td>{{ item.createdAt ? new Date(item.createdAt).toLocaleString() : "—" }}</td>
        <td>{{ item.confirmedAt ? new Date(item.confirmedAt).toLocaleString() : "—" }}</td>
      </tr>
    </tbody>
  </table>
</template>
