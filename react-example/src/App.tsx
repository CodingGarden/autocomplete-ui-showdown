import { useEffect, useState } from "react";
import getAutoCompleteResults from "./getAutoCompleteResults";

function useDebouncedValue(value: string) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (!value) {
      setDebouncedValue("");
      return;
    }
    console.log("Setting timeout...", value);
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value]);

  return debouncedValue;
}

function App() {
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debouncedValue = useDebouncedValue(filter);

  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      setSuggestions([]);
      setError("");
      setLoading(false);
      if (!debouncedValue) return;
      setLoading(true);
      console.log("Calling API with:", debouncedValue);
      try {
        const results = await getAutoCompleteResults(
          debouncedValue,
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
    })();

    return () => {
      abortController.abort();
    };
  }, [debouncedValue]);

  return (
    <section className="container">
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Tree
          <input onChange={(e) => setFilter(e.target.value)} value={filter} />
        </label>
      </form>
      {loading && <progress />}
      {error && (
        <article style={{ background: "#e53935", color: "white" }}>
          {error}
        </article>
      )}
      <section>
        {suggestions.map((suggestion) => (
          <article key={suggestion}>{suggestion}</article>
        ))}
        {!debouncedValue && <p>Type to see suggestions.</p>}
        {!error && debouncedValue && suggestions.length === 0 && !loading && (
          <p>No suggestions to display.</p>
        )}
      </section>
    </section>
  );
}

export default App;
