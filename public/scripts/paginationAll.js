import { fetchData, DIFFICULTY_MAP, sortByName, displayError } from './shared.js?v=1.0.1';

const ROWS_PER_PAGE = 15;
let currentPage = 1;
let fullData = [];
let filteredData = [];

async function initializeTable() {
  try {
    const data = await fetchData();         // full JSON object
    fullData = data.diagrams.map(diagram => {
      const creator = data.creators.find(c => c.id === diagram.creatorId);
      return {
        name: diagram.title,
        difficulty: diagram.difficulty === '★★★' ? 'hard' :
                    diagram.difficulty === '★★' ? 'medium' :
                    'easy',
        categories: diagram.categories,
        creator: creator ? creator.name : 'Unknown',
        download: `./assets/diagrams/${diagram.filename}`
      };
    });

    filteredData = sortByName([...fullData]); // default sort
    displayTable(currentPage);
  } catch (err) {
    console.error("Failed to initialize table:", err);
    displayError("tableContainer", "Failed to load data.");
  }
  populateFilterOptions(data);
}

// Sorting buttons
document.getElementById("sortName").addEventListener("click", () => {
  filteredData = [...filteredData].sort((a, b) => a.name.localeCompare(b.name));
  changePage(1);
});

document.getElementById("sortCategory").addEventListener("click", () => {
  filteredData = [...filteredData].sort((a, b) => a.category.localeCompare(b.category));
  changePage(1);
});

document.getElementById("sortDifficulty").addEventListener("click", () => {
  const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
  filteredData = [...filteredData].sort((a, b) =>
    difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  );
  changePage(1);
});

// Filter dropdown
document.getElementById("filterDifficulty").addEventListener("change", filterAll);
document.getElementById("filterCategory").addEventListener("change", filterAll);
document.getElementById("filterCreator").addEventListener("change", filterAll);

function displayTable(page) {
  const table = document.getElementById("tablePaginated");
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const slicedData = filteredData.slice(startIndex, endIndex);

  table.innerHTML = `
    <tr>
      <th><u>↓</u></th>
      <th>Difficulty</th>
      <th>Name</th>
      <th>Category</th>
      <th>Creator</th>
    </tr>
  `;

  slicedData.forEach(item => {
    const row = table.insertRow();
    row.insertCell(0).innerHTML = `<a href="${item.download}" target="_blank">Download</a>`;
    const diffCell = row.insertCell(1);
    diffCell.innerHTML = DIFFICULTY_MAP[item.difficulty] || item.difficulty;
    diffCell.style.textAlign = "center";
    row.insertCell(2).innerHTML = item.name;
    row.insertCell(3).innerHTML = Array.isArray(item.categories)
      ? item.categories.map(formatCategory).join(', ')
      : formatCategory(item.category || '');
    row.insertCell(4).innerHTML = item.creator;
  });

  updatePagination(page);
}

function formatCategory(category) {
  return category
    .split('-')  // Split by hyphen
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize first letter of each word
    .join(' ');  // Join the words back with space
}

function populateFilterOptions(data) {
  const categorySet = new Set();
  const creatorSet = new Set();

  data.diagrams.forEach(diagram => {
    diagram.categories.forEach(cat => categorySet.add(cat));
    const creator = data.creators.find(c => c.id === diagram.creatorId);
    if (creator) creatorSet.add(creator.name);
  });

  const categorySelect = document.getElementById("filterCategory");
  for (const cat of [...categorySet].sort()) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  }

  const creatorSelect = document.getElementById("filterCreator");
  for (const creator of [...creatorSet].sort()) {
    const opt = document.createElement("option");
    opt.value = creator;
    opt.textContent = creator;
    creatorSelect.appendChild(opt);
  }
}

function filterAll() {
  const difficulty = document.getElementById("filterDifficulty").value;
  const category = document.getElementById("filterCategory").value;
  const creator = document.getElementById("filterCreator").value;

  filteredData = fullData.filter(item => {
    const matchesDifficulty = (difficulty === "all" || item.difficulty === difficulty);
    const matchesCategory = (category === "all" || item.categories.includes(category));
    const matchesCreator = (creator === "all" || item.creator === creator);
    return matchesDifficulty && matchesCategory && matchesCreator;
  });

  changePage(1);
}

function updatePagination(currentPage) {
  const pageCount = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "Page: ";

  function createButton(label, onClick, disabled = false, isCurrent = false) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.disabled = disabled;
    btn.style.background = "none";
    btn.style.border = "none";
    btn.style.margin = "0 4px";
    btn.style.padding = "5px 10px";
    btn.style.cursor = disabled ? "default" : "pointer";
    btn.style.color = disabled ? "transparent" : "#0099ff";
    if (isCurrent) {
      btn.style.fontWeight = "bold";
      btn.style.fontSize = "1.2em";
    }
    if (!disabled) {
      btn.onclick = onClick;
    }
    return btn;
  }

  paginationContainer.appendChild(
    createButton("←", () => changePage(currentPage - 1), currentPage === 1)
  );

  for (let i = 1; i <= pageCount; i++) {
    paginationContainer.appendChild(
      createButton(i, () => changePage(i), false, i === currentPage)
    );
  }

  paginationContainer.appendChild(
    createButton("→", () => changePage(currentPage + 1), currentPage === pageCount)
  );
}

function changePage(page) {
  currentPage = page;
  displayTable(currentPage);
}

document.addEventListener("DOMContentLoaded", initializeTable);