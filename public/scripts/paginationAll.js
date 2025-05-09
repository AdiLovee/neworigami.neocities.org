import { fetchData, DIFFICULTY_MAP, sortByName, displayError } from './shared.js';

const ROWS_PER_PAGE = 15;
let currentPage = 1;
let fullData = [];
let filteredData = [];

async function initializeTable() {
  try {
    const data = await fetchData();         // full JSON object

    // Map each diagram, resolving multiple creators from the array of creatorId values.
    fullData = data.diagrams.map(diagram => {
      // For each creator id (now in an array), look up the corresponding creator's name.
      const creators = diagram.creatorId.map(id => {
        const found = data.creators.find(c => c.id === id);
        return found ? found.name : 'Unknown';
      });
      
      return {
        name: diagram.title,
        difficulty: diagram.difficulty === '★★★' ? 'hard' :
                    diagram.difficulty === '★★' ? 'medium' :
                    'easy',
        // Format each category: replace hyphens with spaces and capitalize words.
        categories: diagram.categories.map(cat =>
          cat.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
        ),
        // Store creators as an array.
        creators: creators,
        download: `./assets/diagrams/${diagram.filename}.pdf`,
        image: `./assets/thumbnails/${diagram.filename}.gif`,
        imagename: `${diagram.filename}.gif`
      };
    });
    document.getElementById("diagramCount").textContent = data.diagrams.length;
    filteredData = sortByName([...fullData]); // default sort
    displayTable(currentPage);
    populateFilterOptions(data);
  } catch (err) {
    console.error("Failed to initialize table:", err);
    displayError("tableContainer", "Failed to load data.");
  }
}

// Sorting buttons
document.getElementById("sortName").addEventListener("click", () => {
  filteredData = [...filteredData].sort((a, b) => a.name.localeCompare(b.name));
  changePage(1);
});

document.getElementById("sortCategory").addEventListener("click", () => {
  filteredData = [...filteredData].sort((a, b) =>
    a.categories.join(', ').localeCompare(b.categories.join(', '))
  );
  changePage(1);
});

document.getElementById("sortDifficulty").addEventListener("click", () => {
  const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
  filteredData = [...filteredData].sort((a, b) =>
    difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  );
  changePage(1);
});

// Filter dropdowns
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
  if (slicedData.length === 0) {
    const row = table.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 5;
    cell.textContent = "No results found.";
    cell.style.textAlign = "center";
    cell.style.fontStyle = "italic";
  } else {
    slicedData.forEach(item => {
      const row = table.insertRow();
      /*
        This shouldn't be displayed as "download" unless the href has the download attribute.
        Clicking this link only opens the file, it doesn't save it, so it's technically not a download.
        The actual download button is in the browser's native PDF viewer.
        It wont break if changed to 'download', but it should just be clear to the user what the button does.
      */
      row.insertCell(0).innerHTML =
      // Once we add images, uncomment and move this above the View PDF button
      //`<a href="${item.download}" target="_blank"><img src="${item.image}">${item.imagename}</img></a><br>
      `
      <a href="${item.download}" target="_blank">View PDF</a>`; 
      
      const diffCell = row.insertCell(1);
      diffCell.innerHTML = DIFFICULTY_MAP[item.difficulty] || item.difficulty;
      diffCell.style.textAlign = "center";
      
      row.insertCell(2).innerHTML = item.name;
      row.insertCell(3).innerHTML = Array.isArray(item.categories)
        ? item.categories.join('<br>')
        : item.categories;
      row.insertCell(4).innerHTML = item.creators.join('<br>');
    });

    updatePagination(page);
  }
}

function populateFilterOptions(data) {
  const categorySet = new Set();
  const creatorSet = new Set();

  data.diagrams.forEach(diagram => {
    // Format and collect each category.
    diagram.categories.forEach(cat => {
      const formattedCategory = cat.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
      categorySet.add(formattedCategory);
    });
    
    // For the new multiple creator structure, iterate over each creator id.
    diagram.creatorId.forEach(id => {
      const creator = data.creators.find(c => c.id === id);
      if (creator) creatorSet.add(creator.name);
    });
  });

  // Populate category filter dropdown.
  const categorySelect = document.getElementById("filterCategory");
  categorySelect.innerHTML = ''; // Clear existing options.
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All Categories";
  categorySelect.appendChild(defaultOption);

  for (const cat of [...categorySet].sort()) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  }

  // Populate creator filter dropdown.
  const creatorSelect = document.getElementById("filterCreator");
  creatorSelect.innerHTML = ''; // Clear existing options.
  const defaultCreatorOption = document.createElement("option");
  defaultCreatorOption.value = "all";
  defaultCreatorOption.textContent = "All Creators";
  creatorSelect.appendChild(defaultCreatorOption);

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
    // Check if the selected creator is among the array of creators.
    const matchesCreator = (creator === "all" || item.creators.includes(creator));
    return matchesDifficulty && matchesCategory && matchesCreator;
  });

  changePage(1);
}

function updatePagination(currentPage) {
  const pageCount = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; // Clear previous buttons

  // Hide pagination if no results
  if (pageCount === 0) return;

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

console.log("paginationAll.js loaded");