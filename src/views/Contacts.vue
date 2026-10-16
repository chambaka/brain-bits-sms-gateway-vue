<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "../api";
import { nameFromRow, parseCsv, phoneFromRow } from "../csv";

type Contact = { destination: string; name: string | null };
type ContactPage = { items: Contact[]; page: number; size: number; total: number };

const page = ref<ContactPage>({ items: [], page: 0, size: 50, total: 0 });
const to = ref("");
const name = ref("");
const consent = ref(true);
const error = ref("");
const notice = ref("");
const loading = ref(false);

async function load(nextPage = page.value.page) {
  loading.value = true;
  error.value = "";
  try {
    page.value = await api<ContactPage>(`/api/v1/contacts?page=${nextPage}&size=${page.value.size}`);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not load contacts";
  } finally {
    loading.value = false;
  }
}

async function saveOne() {
  error.value = "";
  notice.value = "";
  try {
    const result = await api<{ imported: number }>("/api/v1/contacts/import", {
      method: "POST",
      body: JSON.stringify({ contacts: [{ to: to.value, name: name.value }], consent: consent.value })
    });
    to.value = "";
    name.value = "";
    notice.value = `Imported ${result.imported} contact`;
    await load(0);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Import failed";
  }
}

async function onCsv(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  error.value = "";
  notice.value = "";
  try {
    const text = await file.text();
    const rows = parseCsv(text);
    const contacts = rows
      .map((row) => ({ to: phoneFromRow(row), name: nameFromRow(row) }))
      .filter((row) => row.to);
    if (contacts.length === 0) {
      throw new Error("CSV needs a to/phone column and at least one row");
    }
    const result = await api<{ imported: number }>("/api/v1/contacts/import", {
      method: "POST",
      body: JSON.stringify({ contacts, consent: consent.value })
    });
    notice.value = `Imported ${result.imported} contacts from ${file.name}`;
    input.value = "";
    await load(0);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "CSV import failed";
  }
}

const totalPages = () => Math.max(1, Math.ceil(page.value.total / page.value.size));

onMounted(() => load(0));
</script>

<template>
  <h1>Contacts</h1>
  <p class="muted">Import one contact or a CSV with headers <code>to</code> (or <code>phone</code>) and optional <code>name</code>.</p>

  <form class="card stack" @submit.prevent="saveOne">
    <label>Phone <input v-model="to" required placeholder="0712345678" /></label>
    <label>Name <input v-model="name" /></label>
    <label><span><input v-model="consent" type="checkbox" style="width: auto" /> Marketing consent</span></label>
    <label>CSV file <input type="file" accept=".csv,text/csv" @change="onCsv" /></label>
    <p v-if="notice" class="muted">{{ notice }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <button type="submit">Import contact</button>
  </form>

  <div class="row-actions" style="margin-top: 1rem">
    <span class="muted">{{ page.total }} contacts · page {{ page.page + 1 }} / {{ totalPages() }}</span>
    <button class="ghost" type="button" :disabled="page.page <= 0 || loading" @click="load(page.page - 1)">Previous</button>
    <button class="ghost" type="button" :disabled="page.page + 1 >= totalPages() || loading" @click="load(page.page + 1)">Next</button>
  </div>

  <table style="margin-top: 0.75rem">
    <thead><tr><th>Phone</th><th>Name</th></tr></thead>
    <tbody>
      <tr v-for="item in page.items" :key="item.destination">
        <td>{{ item.destination }}</td>
        <td>{{ item.name || "—" }}</td>
      </tr>
    </tbody>
  </table>
</template>
