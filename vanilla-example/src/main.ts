import getAutoCompleteResults from "./getAutoCompleteResults";

const inputElement = document.querySelector("#filter") as HTMLInputElement;
const progressElement = document.querySelector(
  "#progress"
) as HTMLProgressElement;
const suggestionMessageElement = document.querySelector(
  "#suggestionMessage"
) as HTMLElement;
const resultsElement = document.querySelector("#results") as HTMLElement;
const noSuggestionsMessageElement = document.querySelector(
  "#noSuggestionsMessage"
) as HTMLElement;
const errorElement = document.querySelector("#error") as HTMLElement;

let timeoutId = -1;
let abortController = new AbortController();

function init() {
  initializeElements();

  inputElement.addEventListener("input", () => {
    resetUI();
    if (!inputElement.value) {
      suggestionMessageElement.classList.toggle('hide', false)
      resultsElement.replaceChildren();
      return;
    }
    timeoutId = setTimeout(getFilterResults, 400);
  });
}

function resetUI() {
  noSuggestionsMessageElement.classList.toggle('hide', true);
  progressElement.classList.toggle('hide', true)
  resultsElement.classList.toggle('hide', true)
  errorElement.textContent = "";
  errorElement.classList.toggle('hide', true)
  clearTimeout(timeoutId);
  abortController.abort();
}

function initializeElements() {
  progressElement.classList.toggle('hide', true)
  resultsElement.classList.toggle('hide', true)
  noSuggestionsMessageElement.classList.toggle('hide', true)
  errorElement.classList.toggle('hide', true)
}

async function getFilterResults() {
  abortController = new AbortController();
  suggestionMessageElement.classList.toggle('hide', true)
  progressElement.classList.toggle('hide', false)
  try {
    const results = await getAutoCompleteResults(
      inputElement.value,
      abortController.signal
    );
    showResults(results);
  } catch (e) {
    const error = e as Error;
    if (error.name !== "AbortError") {
      errorElement.textContent = error.message;
      errorElement.classList.toggle('hide', false)
    }
  }
  progressElement.classList.toggle('hide', true)
}

function showResults(results: string[]) {
  resultsElement.replaceChildren(
    ...results.map((result) => {
      const resultElement = document.createElement("article");
      resultElement.textContent = result;
      return resultElement;
    })
  );
  resultsElement.classList.toggle('hide', false)
  if (!results.length) {
    noSuggestionsMessageElement.classList.toggle('hide', false)
  }
}

init();