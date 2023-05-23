export default async function getAutoCompleteResults(
  query: string,
  signal: AbortSignal
) {
  if (!query) return [] as string[];
  const response = await fetch(
    `https://tree-suggestion-api.deno.dev/?filter=${query}`,
    { signal }
  );
  const json = await response.json();
  if (response.ok) {
    return json as string[];
  }
  throw new Error(json.message);
}
