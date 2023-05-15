<script lang="ts">
  import getAutoCompleteResults from "./getAutoCompleteResults";

  let debouncedFilter = '';
  let loading = false;
  let error = '';
  let suggestions: string[] = [];

  let abortController = null;

  async function getSuggestions(filter) {
    loading = false;
    error = '';
    suggestions = [];
    if (!filter) {
      return;
    }
    loading = true;
    try {
      const results = await getAutoCompleteResults(filter, abortController.signal)
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

  $: getSuggestions(debouncedFilter);

  let timeout = -1;
  function setDebouncedFilter(event) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();
      debouncedFilter = event.target.value;
    }, 300);
  } 
</script>

<main class="container">
  <form on:submit|preventDefault={() => {}}>
    <label>
      Tree
      <input on:input={setDebouncedFilter} />
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