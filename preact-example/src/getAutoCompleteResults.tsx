export default async function getAutoCompleteResults(
  query: string,
  signal: AbortSignal
) {
  await new Promise((resolve) => setTimeout(resolve, 700));
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