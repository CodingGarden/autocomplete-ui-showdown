<script lang="ts">
  import getAutoCompleteResults from "./getAutoCompleteResults";

  let debouncedFilter = '';
  let abortController = new AbortController();

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
  {#await getAutoCompleteResults(debouncedFilter, abortController.signal)}
    <progress />
  {:then suggestions}
    {#each suggestions as suggestion}
      <article>{suggestion}</article>
    {/each}
    {#if suggestions.length === 0 && debouncedFilter}
      <p>No suggestions to display.</p>
    {/if}
  {:catch error}
    <article style="background: #e53935; color: white">
      {error}
    </article>
  {/await}
  {#if !debouncedFilter}
    <p>Type to see suggestions.</p>
  {/if}
</main>