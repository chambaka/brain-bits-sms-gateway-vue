<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";

type Org = { publicId: string; name: string; accountStatus: string };
type Sender = { id: number; organizationId: number; senderName: string; purpose: string; status: string };
type Campaign = {
  publicId: string;
  organizationId: number;
  name: string;
  messageType: string;
  status: string;
  reviewStatus: string;
  recipientCount: number;
  estimatedTzs: number;
};
type Provider = { code: string; name: string; protocol: string; status: string; maxTps: number };
type Payment = {
  publicId: string;
  organizationId: number;
  amountTzs: number;
  method: string;
  status: string;
  createdAt: string;
};

const organizations = ref<Org[]>([]);
const senders = ref<Sender[]>([]);
const campaigns = ref<Campaign[]>([]);
const providers = ref<Provider[]>([]);
const payments = ref<Payment[]>([]);
const health = ref<{ unpublishedOutbox: number } | null>(null);
const reconciliation = ref<{ balanced: boolean; mismatches: unknown[] } | null>(null);
const error = ref("");
const notice = ref("");

async function load() {
  error.value = "";
  try {
    const [orgs, pendingSenders, pendingCampaigns, providerList, queue, recon, pendingPayments] = await Promise.all([
      api<Org[]>("/api/v1/admin/organizations"),
      api<Sender[]>("/api/v1/admin/sender-ids?status=PENDING"),
      api<Campaign[]>("/api/v1/admin/campaigns?reviewStatus=PENDING"),
      api<Provider[]>("/api/v1/admin/providers"),
      api<{ unpublishedOutbox: number }>("/api/v1/admin/queue-health"),
      api<{ balanced: boolean; mismatches: unknown[] }>("/api/v1/admin/reconciliation"),
      api<Payment[]>("/api/v1/admin/payments?status=PENDING")
    ]);
    organizations.value = orgs;
    senders.value = pendingSenders;
    campaigns.value = pendingCampaigns;
    providers.value = providerList;
    health.value = queue;
    reconciliation.value = recon;
    payments.value = pendingPayments;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Admin data is unavailable";
  }
}

async function suspend(id: string) {
  await api(`/api/v1/admin/organizations/${id}/suspend`, { method: "POST" });
  notice.value = `Suspended ${id}`;
  await load();
}

async function approveSender(id: number) {
  await api(`/api/v1/admin/sender-ids/${id}/approve`, { method: "POST" });
  notice.value = `Approved sender ${id}`;
  await load();
}

async function approveCampaign(id: string) {
  await api(`/api/v1/admin/campaigns/${id}/approve`, { method: "POST" });
  notice.value = `Approved campaign ${id}`;
  await load();
}

async function confirmPayment(id: string) {
  await api(`/api/v1/admin/payments/${id}/confirm`, { method: "POST" });
  notice.value = `Confirmed payment ${id}`;
  await load();
}

onMounted(load);
</script>

<template>
  <h1>Operations</h1>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-if="notice" class="muted">{{ notice }}</p>

  <div class="grid">
    <article class="card"><div class="muted">Unpublished outbox</div><div class="metric">{{ health?.unpublishedOutbox ?? "—" }}</div></article>
    <article class="card"><div class="muted">Ledger balanced</div><div class="metric">{{ reconciliation?.balanced ?? "—" }}</div></article>
    <article class="card"><div class="muted">Pending payments</div><div class="metric">{{ payments.length }}</div></article>
    <article class="card"><div class="muted">Pending senders</div><div class="metric">{{ senders.length }}</div></article>
  </div>

  <h2>Payments to confirm</h2>
  <table>
    <thead><tr><th>ID</th><th>Org</th><th>Amount</th><th>Method</th><th>Created</th><th></th></tr></thead>
    <tbody>
      <tr v-if="payments.length === 0"><td colspan="6" class="muted">No pending payments</td></tr>
      <tr v-for="item in payments" :key="item.publicId">
        <td><code>{{ item.publicId }}</code></td>
        <td>{{ item.organizationId }}</td>
        <td>{{ item.amountTzs }} TZS</td>
        <td>{{ item.method }}</td>
        <td>{{ item.createdAt ? new Date(item.createdAt).toLocaleString() : "—" }}</td>
        <td><button class="ghost" type="button" @click="confirmPayment(item.publicId)">Confirm</button></td>
      </tr>
    </tbody>
  </table>

  <h2>Organizations</h2>
  <table>
    <thead><tr><th>Organization</th><th>Status</th><th></th></tr></thead>
    <tbody>
      <tr v-for="org in organizations" :key="org.publicId">
        <td>{{ org.name }}</td>
        <td>{{ org.accountStatus }}</td>
        <td>
          <button
            v-if="org.accountStatus !== 'SUSPENDED'"
            class="ghost"
            type="button"
            @click="suspend(org.publicId)"
          >
            Suspend
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <h2>Sender approval</h2>
  <table>
    <thead><tr><th>ID</th><th>Org</th><th>Sender</th><th>Purpose</th><th></th></tr></thead>
    <tbody>
      <tr v-if="senders.length === 0"><td colspan="5" class="muted">No pending sender IDs</td></tr>
      <tr v-for="item in senders" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.organizationId }}</td>
        <td>{{ item.senderName }}</td>
        <td>{{ item.purpose }}</td>
        <td><button class="ghost" type="button" @click="approveSender(item.id)">Approve</button></td>
      </tr>
    </tbody>
  </table>

  <h2>Campaign review</h2>
  <table>
    <thead><tr><th>Name</th><th>Type</th><th>Recipients</th><th>Estimate</th><th></th></tr></thead>
    <tbody>
      <tr v-if="campaigns.length === 0"><td colspan="5" class="muted">No campaigns awaiting review</td></tr>
      <tr v-for="item in campaigns" :key="item.publicId">
        <td>{{ item.name }}</td>
        <td>{{ item.messageType }}</td>
        <td>{{ item.recipientCount }}</td>
        <td>{{ item.estimatedTzs }} TZS</td>
        <td><button class="ghost" type="button" @click="approveCampaign(item.publicId)">Approve</button></td>
      </tr>
    </tbody>
  </table>

  <h2>Providers</h2>
  <table>
    <thead><tr><th>Code</th><th>Name</th><th>Protocol</th><th>Status</th><th>Max TPS</th></tr></thead>
    <tbody>
      <tr v-for="item in providers" :key="item.code">
        <td>{{ item.code }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.protocol }}</td>
        <td>{{ item.status }}</td>
        <td>{{ item.maxTps }}</td>
      </tr>
    </tbody>
  </table>
</template>
