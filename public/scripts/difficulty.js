import {
    DIAGRAM_BASE_PATH,
    DIFFICULTY_MAP,
    fetchData,
    sortByTitle
} from './shared.js';

async function loadDifficulty() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const difficulty = urlParams.get('d');
        const starDifficulty = DIFFICULTY_MAP[difficulty];

        if (!difficulty || !starDifficulty) {
            throw new Error('Invalid difficulty level');
        }

        const data = await fetchData();
        const filteredDiagrams = sortByTitle(data.diagrams.filter(d => d.difficulty === starDifficulty));
        const tableBody = document.querySelector('#difficulty-table tbody');

        // Clear table if populated
        tableBody.innerHTML = '';

        if (filteredDiagrams.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">No diagrams found for ${difficulty} difficulty</td>
                </tr>
            `;
            return;
        };

        filteredDiagrams.forEach(diagram => {
            const creator = data.creators.find(c => c.id === diagram.creatorId);
            const row = document.createElement('tr');
            const cats = [];

            // Properly capitalizes the category/categories of diagram
            for (let cat of diagram.categories) {
                cats.push(cat.charAt(0).toUpperCase() + cat.slice(1));
            }

            row.innerHTML = `
                <td>
                    <a href="${DIAGRAM_BASE_PATH}${diagram.filename}">PDF</a>
                </td>
                <td>${diagram.title}</td>
                <td>${cats}</td>
                <td>${creator?.name || 'Unknown Creator'}</td>
            `;
            tableBody.appendChild(row);
            document.getElementById('page-title').textContent = '';
        });

        document.getElementById('page-title').textContent = `Alphabetical list of ${difficulty} models.`;
    } catch (e) {
        console.error('Error:', e);
        document.querySelector('#difficulty-table tbody').innerHTML = `
            <tr>
                <td colspan="4" class="error">Error loading diagrams: ${e.message}</td>
            </tr>
        `;
        document.getElementById('page-title').textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', loadDifficulty);