import { fetchData, DIFFICULTY_MAP, sortByName, displayError } from "./shared.js";

const ROWS_PER_PAGE = 15;
let currentPage = 1;
let fullData = [];
let filteredData = [];

function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    difficulty: params.get("difficulty") || "all",
    category: params.get("category") || "all",
    creator: params.get("creator") || "all",
    page: parseInt(params.get("page")) || 1
  };
}

async function initializeTable() {
  try {
    const data = await fetchData();         // full JSON object
    
    // Update the total diagram count (before any filtering)
    document.getElementById("diagramCount").textContent = data.diagrams.length;

    // Map each diagram, resolving multiple creators from the array of creatorId values.
    fullData = data.diagrams.map(diagram => {
      // For each creator id (now in an array), look up the corresponding creator's name.
      const creators = diagram.creatorId.map(id => {
        const found = data.creators.find(c => c.id === id);
        return found ? found.name : "Unknown";
      });
      
      return {
        name: diagram.title,
        difficulty: diagram.difficulty === "★★★" ? "hard" :
                    diagram.difficulty === "★★" ? "medium" :
                    "easy",
        // Format each category: replace hyphens with spaces and capitalize words.
        categories: diagram.categories.map(cat =>
          cat.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase())
        ),
        // Store creators as an array.
        creators: creators,
        download: `./assets/diagrams/${diagram.filename}.pdf`,
        image: `./assets/thumbnails/${diagram.filename}.gif`,
        imagename: `${diagram.filename}.gif`
      };
    });
    filteredData = sortByName([...fullData]); // default sort
    document.getElementById("filteredCount").textContent = filteredData.length;
    displayTable(currentPage);
    populateFilterOptions(data);
    // Call updateCanonicalURL() after initial data load
    updateCanonicalURL();
    //  Apply filters from URL query string
    const { difficulty, category, creator, page } = getFiltersFromURL();
    updateMetaTags(currentPage, difficulty, category, creator);
    currentPage = page; // ← Set from URL if present
    document.getElementById("filterDifficulty").value = difficulty;
    document.getElementById("filterCategory").value = category;
    document.getElementById("filterCreator").value = creator;

    filterAll(); // This filters and sorts + calls changePage(1)
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
    a.categories.join(", ").localeCompare(b.categories.join(", "))
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

document.getElementById("resetFilters").addEventListener("click", () => {
  // Reset dropdowns to default
  document.getElementById("filterDifficulty").value = "all";
  document.getElementById("filterCategory").value = "all";
  document.getElementById("filterCreator").value = "all";

  // Clear query params from URL
  window.history.replaceState({}, "", window.location.pathname);

  // Reset data and sorting
  filteredData = sortByName([...fullData]);

  // Reset filtered count and update the table
  document.getElementById("filteredCount").textContent = filteredData.length;
  
  // Call the function to display the table with the updated data
  changePage(1); // This will display the first page of the unfiltered data
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

      // Add diagram to structured data (JSON-LD)
      const jsonLD = generateDiagramJSONLD(item);
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = jsonLD;
      document.head.appendChild(script); // Append JSON-LD script to head

      row.insertCell(0).innerHTML =`
        <a href="${item.download}" target="_blank"><img loading="lazy" src="${item.image}" alt="${item.imagename}"></a><br>
        <a href="${item.download}" target="_blank">View PDF</a>`; 
      
      const diffCell = row.insertCell(1);
      diffCell.innerHTML = DIFFICULTY_MAP[item.difficulty] || item.difficulty;
      diffCell.style.textAlign = "center";
      
      row.insertCell(2).innerHTML = item.name;
      row.insertCell(3).innerHTML = item.categories.map(cat => `<a href="./diagrams.html?category=${encodeURIComponent(cat)}">${cat}</a>`).join("<br>");
      row.insertCell(4).innerHTML = item.creators.map(cid => `<a href="./diagrams.html?creator=${encodeURIComponent(cid)}">${cid}</a>`).join("<br>");
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
      const formattedCategory = cat.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
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
  categorySelect.innerHTML = ""; // Clear existing options.
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
  creatorSelect.innerHTML = ""; // Clear existing options.
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

  // Update the URL without reloading the page
  const params = new URLSearchParams();
  if (difficulty !== "all") params.set("difficulty", difficulty);
  if (category !== "all") params.set("category", category);
  if (creator !== "all") params.set("creator", creator);

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);

  // Update canonical URL
  updateCanonicalURL();

  // Apply filters to data
  filteredData = fullData.filter(item => {
    const matchesDifficulty = (difficulty === "all" || item.difficulty === difficulty);
    const matchesCategory = (category === "all" || item.categories.includes(category));
    const matchesCreator = (creator === "all" || item.creators.includes(creator));
    return matchesDifficulty && matchesCategory && matchesCreator;
  });

  // Update the filtered count on the page
  document.getElementById("filteredCount").textContent = filteredData.length;
  filteredData = sortByName(filteredData); // Automatically sort by name
  changePage(1);
}

function updatePagination(currentPage) {
  const pageCount = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginationContainerUpper = document.getElementById("paginationUpper");
  const paginationContainerLower = document.getElementById("paginationLower");
  paginationContainerUpper.innerHTML = ""; // Clear previous buttons
  paginationContainerLower.innerHTML = ""; // Clear previous buttons

  if (pageCount === 0) return;

  paginationContainerUpper.innerHTML = "Page: ";
  paginationContainerLower.innerHTML = "Page: ";

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

  paginationContainerUpper.appendChild(
    createButton("|←", () => changePage(1), currentPage === 1)
  );
  paginationContainerLower.appendChild(
    createButton("|←", () => changePage(1), currentPage === 1)
  );
  paginationContainerUpper.appendChild(
    createButton("←", () => changePage(currentPage - 1), currentPage === 1)
  );
  paginationContainerLower.appendChild(
    createButton("←", () => changePage(currentPage - 1), currentPage === 1)
  );

  const maxVisiblePages = 9;
  const halfWindow = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  let endPage = Math.min(pageCount, currentPage + halfWindow);

  if (endPage - startPage + 1 < maxVisiblePages) {
    if (startPage === 1) {
      endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
    } else if (endPage === pageCount) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
  }

  if (startPage > 1) {
    paginationContainerUpper.appendChild(document.createTextNode(" …"));
    paginationContainerLower.appendChild(document.createTextNode(" …"));
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationContainerUpper.appendChild(
      createButton(i, () => changePage(i), false, i === currentPage)
    );
    paginationContainerLower.appendChild(
      createButton(i, () => changePage(i), false, i === currentPage)
    );
  }

  if (endPage < pageCount) {
    paginationContainerUpper.appendChild(document.createTextNode("… "));
    paginationContainerLower.appendChild(document.createTextNode("… "));
  }

  paginationContainerUpper.appendChild(
    createButton("→", () => changePage(currentPage + 1), currentPage === pageCount)
  );
  paginationContainerLower.appendChild(
    createButton("→", () => changePage(currentPage + 1), currentPage === pageCount)
  );
  paginationContainerUpper.appendChild(
    createButton("→|", () => changePage(pageCount), currentPage === pageCount)
  );
  paginationContainerLower.appendChild(
    createButton("→|", () => changePage(pageCount), currentPage === pageCount)
  );
}

function changePage(page) {
  currentPage = page;
  displayTable(currentPage);
  
  // Update URL with current filters and page
  const difficulty = document.getElementById("filterDifficulty").value;
  const category = document.getElementById("filterCategory").value;
  const creator = document.getElementById("filterCreator").value;

  const params = new URLSearchParams();
  if (difficulty !== "all") params.set("difficulty", difficulty);
  if (category !== "all") params.set("category", category);
  if (creator !== "all") params.set("creator", creator);
  if (page > 1) params.set("page", page); // only include page if not 1

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
  
  // Update canonical URL for current page and filters
  updateCanonicalURL();

  // Update meta tags for SEO
  updateMetaTags(currentPage, difficulty, category, creator);
}

// SEO
function updateMetaTags(page, difficulty, category, creator) {
  const titleBase = "NewOrigami - Archive of Diagrams";
  const parts = [];

  if (difficulty !== "all") parts.push(capitalize(difficulty) + " Difficulty");
  if (category !== "all") parts.push(`Category: ${category}`);
  if (creator !== "all") parts.push(`By ${creator}`);
  if (page > 1) parts.push(`Page ${page}`);

  const fullTitle = `${titleBase} - ${parts.join(" - ") || "All Diagrams"}`;
  document.title = fullTitle;

  const description = `Explore ${titleBase.toLowerCase()}${parts.length ? " filtered by " + parts.join(", ") : ""}.`;

  let metaDesc = document.querySelector("meta[name=\"description\"]");
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = description;
}

function updateCanonicalURL() {
  const canonicalUrl = window.location.origin + window.location.pathname + window.location.search;
  let link = document.querySelector("link[rel=\"canonical\"]");
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = canonicalUrl;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// AUTO-GENERATE STRUCTURED JSON-LD FOR A DIAGRAM
function generateDiagramJSONLD(diagram) {
  const creators = diagram.creators.map(creator => {
    return {
      "@type": "Person",
      "name": creator
    };
  });

  const jsonLD = {
    "@context": "http://schema.org",
    "@type": "CreativeWork",
    "name": diagram.name,
    "description": `Logic diagram titled "${diagram.name}" categorized under ${diagram.categories.join(", ")}.`,
    "category": diagram.categories.join(", "),
    "creator": creators,
    "difficulty": diagram.difficulty,
    "image": diagram.image,
    "url": diagram.download,  // Link to the diagram PDF file
    "thumbnailUrl": diagram.image,
    "publisher": {
      "@type": "Organization",
      "name": "Logic Diagrams"
    }
  };

  return JSON.stringify(jsonLD);
}

document.addEventListener("DOMContentLoaded", initializeTable);

console.log("paginationAll.js loaded");