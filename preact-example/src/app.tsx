import { useSignal, useSignalEffect } from "@preact/signals";
import getAutoCompleteResults from "./getAutoCompleteResults";

let debounceTimeout = -1;
export function App() {
  const debouncedFilter = useSignal("");
  const loading = useSignal(false);
  const error = useSignal('');
  const filterResults = useSignal<string[]>([]);

  useSignalEffect(() => {
    const abortController = new AbortController();
    filterResults.value = [];
    error.value = '';
    const cleanup = () => abortController.abort();
    if (!debouncedFilter.value) {
      return cleanup;
    }
    (async () => {
      loading.value = true;
      try {
        const results = await getAutoCompleteResults(debouncedFilter.value, abortController.signal);
        if (!abortController.signal.aborted) {
          filterResults.value = results;
        }
      } catch (e) {
        const err = e as Error;
        if (err.name !== "AbortError") {
          error.value = err.message;
        }
      }
      if (!abortController.signal.aborted) {
        loading.value = false;
      }
    })();
    return cleanup;
  });

  return (
    <main class="container">
      <label for="tree">
        Tree
        <input
          onInput={(event) => {
            clearTimeout(debounceTimeout);
            let inputValue = event.currentTarget.value;
            if (!inputValue) {
              debouncedFilter.value = inputValue;
            } else {
              debounceTimeout = setTimeout(() => {
                debouncedFilter.value = inputValue;
              }, 400);
            }
          }}
          name="tree"
          id="tree"
        />
      </label>
      {error.value && (
        <article style={{ background: "#e53935", color: "white" }}>
          {error.value}
        </article>
      )}
      <section>
        {loading.value && <progress />}
        {filterResults.value.map((result) => (
          <article>{result}</article>
        ))}
        {!debouncedFilter.value && <p>Type to see suggestions.</p>}
        {!error.value && debouncedFilter.value && filterResults.value.length === 0 && !loading.value && (
          <p>No suggestions to display.</p>
        )}
      </section>
    </main>
  );
}
