export const DIAGRAM_BASE_PATH = './assets/diagrams/';
export const CATEGORY_BASE_PATH = './category.html?c=';
export const CREATOR_BASE_PATH = './creator.html?id=';
export const DIFFICULTY_BASE_PATH = './difficulty.html?d=';
export const DATA_URL = './data/origami.json';
export const DIFFICULTY_MAP = {
    easy: '★',
    medium: '★★',
    hard: '★★★'
};

export async function fetchData() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) { throw new Error(`HTTP error! Status: ${response.status}`); }
        return await response.json();
    } catch (e) {
        console.error('Data fetch error:', e);
        throw error;
    }
};

export function displayError(elementId, msg, showRetry = true) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML =`
            <span class="error">${msg}</span>
            ${showRetry ? '<a href="javascript:location.reload()">Try again</a>' : ''}
        `;
    }
}

export function sortByName(arr) {
    return arr.sort((a, b) => a.name.localeCompare(b.name));
}

export function sortByCategory(arr) {
    return arr.sort((a, b) =>a.localeCompare(b));
}

export function sortByTitle(arr) {
    return arr.sort((a, b) => a.title.localeCompare(b.title));
}