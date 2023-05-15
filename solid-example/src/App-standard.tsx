import { Accessor, Component, onCleanup } from 'solid-js';
import { createSignal, createEffect } from 'solid-js';
import getAutoCompleteResults from "./getAutoCompleteResults";

function useDebouncedValue(value: Accessor<string>) {
  const [debouncedValue, setDebouncedValue] = createSignal(value());

  createEffect(() => {
    if (!value()) {
      setDebouncedValue("");
      return;
    }
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value());
    }, 300);
    onCleanup(() => {
      clearTimeout(timeoutId);
    });
  });

  return debouncedValue;
}

const App: Component = () => {
  const [filter, setFilter] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [suggestions, setSuggestions] = createSignal<string[]>([]);
  const debouncedValue = useDebouncedValue(filter);

  createEffect(async () => {
    const abortController = new AbortController();
    onCleanup(() => {
      abortController.abort();
    });
    setSuggestions([]);
    setError("");
    setLoading(false);
    if (!debouncedValue()) return;
    setLoading(true);
    console.log("Calling API with:", debouncedValue());
    try {
      const results = await getAutoCompleteResults(
        debouncedValue(),
        abortController.signal
      );
      console.log("Got API results:", results);
      setSuggestions(results);
      setLoading(false);
    } catch (e) {
      const error = e as Error;
      if (error.name !== "AbortError") {
        setError(error.message);
        setLoading(false);
      }
    }
  });

  return (
    <section class="container">
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Tree
          <input onInput={(e) => {
            setFilter(e.target.value);
          }} value={filter()} />
        </label>
      </form>
      {loading() && <progress />}
      {error() && (
        <article style={{ background: "#e53935", color: "white" }}>
          {error()}
        </article>
      )}
      <section>
        {suggestions().map((suggestion) => (
          <article>{suggestion}</article>
        ))}
        {!debouncedValue() && <p>Type to see suggestions.</p>}
        {!error() && debouncedValue() && suggestions().length === 0 && !loading() && (
          <p>No suggestions to display.</p>
        )}
      </section>
    </section>
  );
};

export default App;
