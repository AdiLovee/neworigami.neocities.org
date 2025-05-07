import {
  DIAGRAM_BASE_PATH,
  fetchData,
  sortByTitle
} from './shared.js';

async function loadDiagrams() {
  try {
    const data = await fetchData();
    const tableBody = document.querySelector('#diagram-table tbody');
    const diagrams = sortByTitle(data.diagrams);

    // Clear table if populated
    tableBody.innerHTML = '';

    if (diagrams.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4">No diagrams found.</td>
        </tr>
      `;
      return;
    };

    diagrams.forEach(diagram => {
      const creator = data.creators.find(c => c.id === diagram.creatorId);
      const row = document.createElement('tr');
      const cats = [];

      // Capitalizes category/categories of diagram
      for (let cat of diagram.categories) {
        cats.push(cat.charAt(0).toUpperCase() + cat.slice(1));
      }

      row.innerHTML = `
        <td>
          <a href="${DIAGRAM_BASE_PATH}${diagram.filename}">PDF</a>
        </td>
        <td id="difficulty-row">${diagram.difficulty}</td>
        <td>${diagram.title}</td>
        <td>${cats}</td>
        <td>${creator?.name || 'Unknown Creator'}</td>
      `;
      tableBody.appendChild(row);
      document.getElementById('page-title').textContent = '';
    });

  } catch (e) {
    console.error('Error:', e);
    document.querySelector('#diagram-table tbody').innerHTML = `
      <tr>
        <td colspan="5" class="error">Error loading diagrams: ${e.message}</td>
      </tr>
    `;
    document.getElementById('page-title').textContent = '';
  }
};

document.addEventListener('DOMContentLoaded', loadDiagrams);