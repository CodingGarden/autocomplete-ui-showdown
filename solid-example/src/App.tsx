import {
  Accessor,
  Component,
  For,
  Match,
  Show,
  Switch,
  onCleanup,
} from "solid-js";
import { createSignal, createEffect, createResource } from "solid-js";
import getAutoCompleteResults from "./getAutoCompleteResults";

function useDebouncedValue(value: Accessor<string>) {
  const [debouncedValue, setDebouncedValue] = createSignal(value());
  const [abortController, setAbortController] = createSignal(
    new AbortController()
  );

  createEffect(() => {
    if (!value()) {
      setDebouncedValue("");
      return;
    }
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      setAbortController(abortController);
      setDebouncedValue(value());
    }, 300);
    onCleanup(() => {
      abortController.abort();
      clearTimeout(timeoutId);
    });
  });

  return { debouncedValue, abortController };
}

const App: Component = () => {
  const [filter, setFilter] = createSignal("");
  const { debouncedValue, abortController } = useDebouncedValue(filter);
  const [suggestions] = createResource(debouncedValue, (value) =>
    getAutoCompleteResults(value, abortController().signal)
  );

  return (
    <section class="container">
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Tree
          <input
            onInput={(e) => {
              setFilter(e.target.value);
            }}
            value={filter()}
          />
        </label>
      </form>
      <Switch>
        <Match when={suggestions.loading}>
          <progress />
        </Match>
        <Match when={suggestions.error}>
          <Show when={suggestions.error.name !== 'AbortError'}>
            <article style={{ background: "#e53935", color: "white" }}>
              {suggestions.error.message}
            </article>
          </Show>
        </Match>
        <Match when={!suggestions.loading && suggestions()?.length}>
          <For each={suggestions()}>
            {(suggestion) => <article>{suggestion}</article>}
          </For>
        </Match>
        <Match when={!debouncedValue()}>
          <p>Type to see suggestions.</p>
        </Match>
        <Match when={debouncedValue()}>
          <p>No suggestions to display.</p>
        </Match>
      </Switch>
    </section>
  );
};

export default App;
