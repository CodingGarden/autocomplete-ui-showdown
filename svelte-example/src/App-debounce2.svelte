<script lang="ts">
  import getAutoCompleteResults from "./getAutoCompleteResults";

  let filter = '';
  let debouncedFilter = '';
  let loading = false;
  let error = '';
  let suggestions: string[] = [];

  let abortController = null;

  async function getSuggestions(debouncedFilter) {
    loading = false;
    error = '';
    suggestions = [];
    if (!filter) {
      return;
    }
    loading = true;
    try {
      const results = await getAutoCompleteResults(debouncedFilter, abortController.signal)
      suggestions = results;
      loading = false;
    } catch (e) {
      const err = e as Error;
      if (err.name !== "AbortError") {
        error = err.message;
        loading = false;
      }
    }
  }

  let timeout = -1;
  $: setFilter(filter);

  function setFilter(filter) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();
      debouncedFilter = filter;
    }, 300);
  }

  $: getSuggestions(debouncedFilter);
</script>

<main class="container">
  <form on:submit|preventDefault={() => {}}>
    <label>
      Tree
      <input bind:value={filter} />
    </label>
  </form>
  {#if loading}
    <progress />
  {/if}
  {#if error}
    <article style="background: #e53935; color: white">
      {error}
    </article>
  {/if}
  {#each suggestions as suggestion}
    <article>{suggestion}</article>
  {/each}
  {#if !debouncedFilter}
    <p>Type to see suggestions.</p>
  {/if}
  {#if !error && debouncedFilter && suggestions.length === 0 && !loading}
    <p>No suggestions to display.</p>
  {/if}
</main>