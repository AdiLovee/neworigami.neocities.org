import {
    DIAGRAM_BASE_PATH,
    fetchData,
    displayError,
    sortByTitle
} from './shared.js';

async function loadDiagrams() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const creatorId = urlParams.get('id');

        if (!creatorId) {
            throw new Error('Invalid creator');
        }

        const data = await fetchData();
        const filteredDiagrams = sortByTitle(data.diagrams.filter(d => d.creatorId === creatorId));
        const tableBody = document.querySelector('#diagram-table tbody');
        const creator = data.creators.find(c => c.id === creatorId);

        // Clear table if populated
        tableBody.innerHTML = '';

        if (filteredDiagrams.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">No diagrams found for ${creator}</td>
                </tr>
            `;
            return;
        };

        filteredDiagrams.forEach(diagram => {
            const row = document.createElement('tr');
            const cats = [];
            console.log(cats);

            // Properly capitalizes the category/categories of diagram
            for (let cat of diagram.categories) {
                cats.push(cat.charAt(0).toUpperCase() + cat.slice(1));
            };

            row.innerHTML = `
                <td>
                    <a href="${DIAGRAM_BASE_PATH}${diagram.filename}">PDF</a>
                </td>
                <td id="difficulty-row">${diagram.difficulty}</td>
                <td>${diagram.title}</td>
                <td>${cats}</td>
            `;
            tableBody.appendChild(row);
            document.getElementById('creator-name').textContent = `Diagrams by ${creator.name}`;
        });
    } catch (e) {
        console.error('Error:', e);
        document.querySelector('#diagram-table tbody').innerHTML = `
            <tr>
                <td colspan="4" class="error">Error loading diagrams: ${e.message}</td>
            </tr>
        `;
        document.getElementById('creator-name').textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', loadDiagrams);