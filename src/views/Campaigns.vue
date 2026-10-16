<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";
import { nameFromRow, parseCsv, phoneFromRow, variablesFromRow } from "../csv";

type Campaign = {
  publicId: string;
  name: string;
  status: string;
  reviewStatus: string;
  recipientCount: number;
  estimatedTzs: number;
  messageType: string;
};

type Recipient = { to: string; name?: string; variables?: Record<string, string> };

type SavedTemplate = { publicId: string; name: string; messageType: string; body: string };

const campaigns = ref<Campaign[]>([]);
const savedTemplates = ref<SavedTemplate[]>([]);
const selectedTemplateId = ref("");
const name = ref("School fee reminders");
const senderId = ref("CHAMBAKA");
const type = ref<"TRANSACTIONAL" | "MARKETING">("TRANSACTIONAL");
const template = ref("Dear {{name}}, your balance is {{balance}} TZS.");
const listText = ref("0712345678,Amina,50000");
const recipients = ref<Recipient[]>([]);
const error = ref("");
const notice = ref("");
const estimated = ref<Campaign | null>(null);

async function load() {
  campaigns.value = await api("/api/v1/campaigns");
  savedTemplates.value = await api("/api/v1/templates");
}

function applyTemplate() {
  const found = savedTemplates.value.find((item) => item.publicId === selectedTemplateId.value);
  if (!found) return;
  template.value = found.body;
  if (found.messageType === "TRANSACTIONAL" || found.messageType === "MARKETING") {
    type.value = found.messageType;
  }
}

function parseList(): Recipient[] {
  const text = listText.value.trim();
  if (!text) return [];
  if (text.includes(",") && (text.toLowerCase().startsWith("to") || text.toLowerCase().startsWith("phone") || text.includes("\n"))) {
    const looksLikeHeader = /^(to|phone|msisdn|destination)\b/i.test(text.split(/\r?\n/)[0] || "");
    if (looksLikeHeader || text.split(/\r?\n/).length > 1) {
      return parseCsv(looksLikeHeader ? text : `to,name,balance\n${text}`)
        .map((row) => ({
          to: phoneFromRow(row),
          name: nameFromRow(row) || undefined,
          variables: variablesFromRow(row)
        }))
        .filter((row) => row.to);
    }
  }
  return text.split(/\r?\n/).map((line) => {
    const parts = line.split(",").map((p) => p.trim());
    const to = parts[0] || "";
    const person = parts[1] || "";
    const balance = parts[2] || "";
    const variables: Record<string, string> = {};
    if (person) variables.name = person;
    if (balance) variables.balance = balance;
    return { to, name: person || undefined, variables };
  }).filter((row) => row.to);
}

async function onCsv(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  error.value = "";
  try {
    const text = await file.text();
    listText.value = text;
    recipients.value = parseList();
    notice.value = `Loaded ${recipients.value.length} recipients from ${file.name}`;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not read CSV";
  }
}

async function estimate() {
  error.value = "";
  notice.value = "";
  estimated.value = null;
  try {
    const parsed = parseList();
    recipients.value = parsed;
    if (parsed.length === 0) {
      throw new Error("Add recipients as CSV or one line per number: phone,name,balance");
    }
    const created = await api<Campaign>("/api/v1/campaigns", {
      method: "POST",
      body: JSON.stringify({
        name: name.value,
        senderId: senderId.value,
        type: type.value,
        messageTemplate: template.value,
        recipients: parsed
      })
    });
    estimated.value = created;
    notice.value = `Estimated ${created.estimatedTzs} TZS for ${created.recipientCount} recipients`
      + (created.reviewStatus === "PENDING" ? ". Marketing review is required before confirm." : ".");
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Estimate failed";
  }
}

async function confirm(publicId: string) {
  error.value = "";
  notice.value = "";
  try {
    await api(`/api/v1/campaigns/${publicId}/confirm`, { method: "POST" });
    notice.value = `Campaign ${publicId} confirmed and queued for dispatch`;
    if (estimated.value?.publicId === publicId) estimated.value = null;
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Confirm failed";
  }
}

onMounted(() => load().catch((err) => (error.value = err.message)));
</script>

<template>
  <h1>Campaigns</h1>
  <p class="muted">Estimate cost first, then confirm. CSV headers: <code>to</code>, optional <code>name</code>, plus template variables as columns.</p>

  <form class="card stack" @submit.prevent="estimate">
    <label>Name <input v-model="name" /></label>
    <label>Sender <input v-model="senderId" /></label>
    <label>Type
      <select v-model="type">
        <option value="TRANSACTIONAL">TRANSACTIONAL</option>
        <option value="MARKETING">MARKETING</option>
      </select>
    </label>
    <label>Saved template
      <select v-model="selectedTemplateId" @change="applyTemplate">
        <option value="">(write your own)</option>
        <option v-for="item in savedTemplates" :key="item.publicId" :value="item.publicId">
          {{ item.name }}
        </option>
      </select>
    </label>
    <label>Template <textarea v-model="template" rows="3" /></label>
    <label>Recipients (CSV or lines) <textarea v-model="listText" rows="6" /></label>
    <label>Or upload CSV <input type="file" accept=".csv,text/csv" @change="onCsv" /></label>
    <p v-if="notice" class="muted">{{ notice }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <div class="row-actions">
      <button type="submit">Estimate</button>
      <button
        v-if="estimated && estimated.status === 'ESTIMATED' && estimated.reviewStatus === 'APPROVED'"
        type="button"
        @click="confirm(estimated.publicId)"
      >
        Confirm {{ estimated.estimatedTzs }} TZS
      </button>
    </div>
  </form>

  <table style="margin-top: 1rem">
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Status</th>
        <th>Review</th>
        <th>Recipients</th>
        <th>Estimate</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in campaigns" :key="item.publicId">
        <td>{{ item.name }}</td>
        <td>{{ item.messageType }}</td>
        <td>{{ item.status }}</td>
        <td>{{ item.reviewStatus }}</td>
        <td>{{ item.recipientCount }}</td>
        <td>{{ item.estimatedTzs }} TZS</td>
        <td>
          <button
            v-if="item.status === 'ESTIMATED' && item.reviewStatus === 'APPROVED'"
            class="ghost"
            type="button"
            @click="confirm(item.publicId)"
          >
            Confirm
          </button>
          <span v-else-if="item.reviewStatus === 'PENDING'" class="muted">Awaiting review</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
