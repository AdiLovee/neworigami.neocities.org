import {
    DIAGRAM_BASE_PATH,
    DIFFICULTY_MAP,
    fetchData,
    sortByTitle
} from './shared.js';

async function loadCategory() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('c');

        if (!category) {
            throw new Error('Invalid category');
        }

        const data = await fetchData();
        const filteredDiagrams = sortByTitle(data.diagrams.filter(d => d.categories && d.categories.includes(category)));
        const tableBody = document.querySelector('#category-table tbody');

        // Clear table if populated
        tableBody.innerHTML = '';

        if (filteredDiagrams.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">No diagrams found for ${category} difficulty</td>
                </tr>
            `;
            return;
        };

        filteredDiagrams.forEach(diagram => {
            const creator = data.creators.find(c => c.id === diagram.creatorId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <a href="${DIAGRAM_BASE_PATH}${diagram.filename}">PDF</a>
                </td>
                <td>${diagram.title}</td>
                <td id="difficulty-row">${diagram.difficulty}</td>
                <td>${creator?.name}</td>
            `;
            tableBody.appendChild(row);
            document.getElementById('page-title').textContent = '';
        })
    } catch (e) {
        console.error('Error:', e);
        document.querySelector('#category-table tbody').innerHTML = `
            <tr>
                <td colspan="4" class="error">Error loading diagrams: ${e.message}</td>
            </tr>
        `;
    }
};

document.addEventListener('DOMContentLoaded', loadCategory);