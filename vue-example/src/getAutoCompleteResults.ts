export default async function getAutoCompleteResults(
  query: string,
  signal: AbortSignal
) {
  if (!query) return [];
  const response = await fetch(
    `https://tree-suggestion-api.deno.dev/?filter=${query}`,
    { signal }
  );
  const json = await response.json();
  if (response.ok) {
    return json;
  }
  throw new Error(json.message);
}
