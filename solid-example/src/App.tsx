import { Accessor, Component, onCleanup } from 'solid-js';
import { createSignal, createEffect, createResource } from 'solid-js';
import getAutoCompleteResults from "./getAutoCompleteResults";

function useDebouncedValue(value: Accessor<string>) {
  const [debouncedValue, setDebouncedValue] = createSignal(value());
  const [abortController, setAbortController] = createSignal(new AbortController());

  createEffect(() => {
    if (!value()) {
      setDebouncedValue("");
      return;
    }
    const timeoutId = setTimeout(() => {
      setAbortController(new AbortController());
      setDebouncedValue(value());
    }, 300);
    onCleanup(() => {
      abortController().abort();
      clearTimeout(timeoutId);
    });
  });

  return { debouncedValue, abortController };
}

const App: Component = () => {
  const [filter, setFilter] = createSignal("");
  const { debouncedValue, abortController } = useDebouncedValue(filter);
  const [suggest] = createResource(debouncedValue, (value) => getAutoCompleteResults(
    value,
    abortController().signal
  ))

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
      {suggest.loading && <progress />}
      {suggest.error && (
        <article style={{ background: "#e53935", color: "white" }}>
          {suggest.error.message}
        </article>
      )}
      <section>
        {!suggest.loading && suggest()?.map((suggestion) => (
          <article>{suggestion}</article>
        ))}
        {!debouncedValue() && <p>Type to see suggestions.</p>}
        {!suggest.error && debouncedValue() && !suggest()?.length && !suggest.loading && (
          <p>No suggestions to display.</p>
        )}
      </section>
    </section>
  );
};

export default App;
