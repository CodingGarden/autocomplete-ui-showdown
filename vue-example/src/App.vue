<script setup lang="ts">
import { ref, watch } from 'vue';
import getAutoCompleteResults from "./getAutoCompleteResults";

const filter = ref('');
const debouncedFilter = ref('');
const loading = ref(false);
const error = ref('');
const suggestions = ref<string[]>([]);
let abortController: AbortController | null = null;

async function getSuggestions(debouncedFilter: string) {
  loading.value = false;
  error.value = '';
  suggestions.value = [];
  if (!abortController) return;
  if (!filter) {
    return;
  }
  loading.value = true;
  try {
    const results = await getAutoCompleteResults(debouncedFilter, abortController.signal)
    suggestions.value = results;
    loading.value = false;
  } catch (e) {
    const err = e as Error;
    if (err.name !== "AbortError") {
      error.value = err.message;
      loading.value = false;
    }
  }
}

let timeout = -1;
watch(filter, () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    debouncedFilter.value = filter.value;
    getSuggestions(filter.value)
  }, 300);
});
</script>

<template>
  <main class="container">
    <form @submit.prevent="">
      <label>
        Tree
        <input v-model="filter" />
      </label>
    </form>
    <progress v-if="loading" />
    <article v-if="error" style="background: #e53935; color: white">
      {{ error }}
    </article>
    <article v-for="suggestion in suggestions" :key="suggestion">{{ suggestion }}</article>
    <p v-if="!debouncedFilter">Type to see suggestions.</p>
    <p v-if="!error && debouncedFilter && suggestions.length === 0 && !loading">No suggestions to display.</p>
  </main>
</template>
