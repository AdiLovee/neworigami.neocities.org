export const DIAGRAM_BASE_PATH = "./assets/diagrams/";
export const CATEGORY_BASE_PATH = "./category.html?c=";
export const CREATOR_BASE_PATH = "./creator.html?id=";
export const DIFFICULTY_BASE_PATH = "./difficulty.html?d=";
export const DATA_URL = "./data/diagramDict.json";
export const ROWS_PER_PAGE = 15; // Number of diagram entries to show per page

export const DIFFICULTY_MAP = {
  easy: "★",
  medium: "★★",
  hard: "★★★"
};

export async function fetchData() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error("Data fetch error:", e);
    throw e;
  }
}

export function displayError(elementId, msg, showRetry = true) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = `
      <span class="error">${msg}</span>
      ${showRetry ? "<a href=\"javascript:location.reload()\">Try again</a>" : ""}
    `;
  }
}

export function sortByName(arr) {
  return arr.sort((a, b) => a.name.localeCompare(b.name));
}

export function sortByCategory(arr) {
  return arr.sort((a, b) => a.localeCompare(b));
}

export function sortByTitle(arr) {
  return arr.sort((a, b) => a.title.localeCompare(b.title));
}

export function encodeQueryParam(str) {
  return encodeURIComponent(str).replace(/%20/g, '+');
}

console.log("shared.js loaded");