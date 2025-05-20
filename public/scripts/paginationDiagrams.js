// Import shared utility functions and constants from the shared module
import { fetchData, DIFFICULTY_MAP, sortByName, displayError } from "./shared.js";

// Constants for pagination and state management
const ROWS_PER_PAGE = 15;  // Number of diagram entries to show per page
let currentPage = 1;       // Tracks the current page number (1-based)
let fullData = [];         // Stores the complete dataset loaded from the source (unfiltered)
let filteredData = [];     // Stores the currently filtered and sorted subset of fullData

// Parse query parameters from URL to extract filter and pagination settings
function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    difficulty: params.get("difficulty") || "all",
    category: params.get("category") || "all",
    creator: params.get("creator") || "all",
    page: parseInt(params.get("page")) || 1
  };
}
// Main initialization function to load data, setup filters, and render the table
async function initializeTable() {
  try {
    const data = await fetchData();  // Fetch data JSON containing diagrams and creators

    // Show total count of diagrams before any filters are applied
    document.getElementById("diagramCount").textContent = data.diagrams.length;

    // Normalize and transform raw diagram data into a consistent format for display/filtering
    fullData = data.diagrams.map(diagram => {
      // Map creator IDs to creator names; fallback to "Unknown" if not found
      const creators = diagram.creatorId.map(id => {
        const found = data.creators.find(c => c.id === id);
        return found ? found.name : "Unknown";
      });
      // Format categories to individual entries; fallback to "Unknown" if not found
      const categories = diagram.categories.map(data => {
        const found = data.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
        return found ? found : "Unknown";
      });
      // Convert difficulty stars to simple string labels for easier filtering
      const difficulty = diagram.difficulty === "★★★" ? "hard" :
                    diagram.difficulty === "★★" ? "medium" : "easy";
      
      return {
        name: diagram.title,  // Diagram title
        difficulty: difficulty,
        // Format categories by replacing dashes with spaces and capitalizing words
        categories: categories,                                // Category array
        creators: creators,                                    // Creator names array
        download: `./assets/diagrams/${diagram.filename}.pdf`, // Link to downloadable PDF
        image: `./assets/thumbnails/${diagram.filename}.gif`,  // Thumbnail image path
        imagename: `${diagram.filename}.gif`                   // Image filename for alt text
      };
    });
    // Initially sort the data by name alphabetically and show count after normalization
    filteredData = sortByName([...fullData]);
    document.getElementById("filteredCount").textContent = filteredData.length;

    // Display the first page of results
    displayTable(currentPage);

    // Populate the dropdown filter options dynamically based on available categories and creators
    populateFilterOptions(data);

    // Extract filter settings and page number from URL parameters
    const { difficulty, category, creator, page } = getFiltersFromURL();

    // Update page metadata (title, description) based on initial filter state for SEO
    updateMetaTags(currentPage, difficulty, category, creator);

    // Set current page number from URL or default
    currentPage = page;

    // Set filter dropdown UI elements to reflect the URL filter state
    document.getElementById("filterDifficulty").value = difficulty;
    document.getElementById("filterCategory").value = category;
    document.getElementById("filterCreator").value = creator;

    // Update canonical URL for SEO to reflect current filter state
    updateCanonicalURL();

    // Apply all filters and render filtered results on page load
    filterAll();
  } catch (err) {
    // On error (e.g. network failure), log and show an error message in the UI
    console.error("Failed to initialize table:", err);
    displayError("tableContainer", "Failed to load data.");
  }
}

// Event handlers for sorting buttons to sort filteredData and reset to page 1

// Sort filteredData alphabetically by diagram name
document.getElementById("sortName").addEventListener("click", () => {
  filteredData = [...filteredData].sort((a, b) => a.name.localeCompare(b.name));
  changePage(1);  // Reset to first page after sorting
});

// Sort filteredData alphabetically by concatenated categories string
document.getElementById("sortCategory").addEventListener("click", () => {
  filteredData = [...filteredData].sort((a, b) =>
    a.categories.join(", ").localeCompare(b.categories.join(", "))
  );
  changePage(1);
});

// Sort filteredData by difficulty using a predefined order (easy < medium < hard)
document.getElementById("sortDifficulty").addEventListener("click", () => {
  const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
  filteredData = [...filteredData].sort((a, b) =>
    difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  );
  changePage(1);
});

// Sort filteredData alphabetically by concatenated creators string
document.getElementById("sortCreator").addEventListener("click", () => {
  filteredData = [...filteredData].sort((a,b) =>
    a.creators.join(", ").localeCompare(b.creators.join(", "))
  );
  changePage(1);
});



document.getElementById("resetFilters").addEventListener("click", () => {
  // Reset all filters to default "all" and clear URL parameters, then refresh display
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

// Attach filter change handlers to dropdowns so that changing any filter triggers filtering
document.getElementById("filterDifficulty").addEventListener("change", filterAll);
document.getElementById("filterCategory").addEventListener("change", filterAll);
document.getElementById("filterCreator").addEventListener("change", filterAll);

// Render the specified page of filtered results inside the table element
function displayTable(page) {
  const table = document.getElementById("tablePaginated");
  // Calculate start and end index for slicing filteredData based on page size
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const slicedData = filteredData.slice(startIndex, endIndex);
  // Insert table header row with column titles and sorting indicators
  table.innerHTML = `
    <tr>
      <th><u>↓</u></th>
      <th>Difficulty</th>
      <th>Name</th>
      <th>Category</th>
      <th>Creator</th>
    </tr>
  `;
  // If no data matches filters, show a friendly no-results message spanning all columns
  if (slicedData.length === 0) {
    const row = table.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 5;
    cell.textContent = "No results found.";
    cell.style.textAlign = "center";
    cell.style.fontStyle = "italic";
  } else {
    // For each diagram entry, create a row and fill cells with relevant data
    slicedData.forEach(item => {
      const row = table.insertRow();

      // Inject structured data (JSON-LD script) into the document head for SEO benefits
      const jsonLD = generateDiagramJSONLD(item);
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = jsonLD;
      document.head.appendChild(script);

      // Thumbnail cell: image linked to downloadable PDF and a link below to open PDF
      row.insertCell(0).innerHTML =`
        <a href="${item.download}" target="_blank">
          <img loading="lazy" src="${item.image}" alt="${item.imagename}">
        </a><br>
        <a href="${item.download}" target="_blank">
          View PDF
        </a>`; 
      
      // Difficulty cell: show difficulty label with center alignment
      const diffCell = row.insertCell(1);
      diffCell.innerHTML = DIFFICULTY_MAP[item.difficulty] || item.difficulty;
      diffCell.style.textAlign = "center";

      // Name cell: diagram title as plain text
      row.insertCell(2).innerHTML = item.name;

      // Category cell: each category linked to filtered results by category
      row.insertCell(3).innerHTML = item.categories.map(cat => `<a href="diagrams.html?category=${encodeURIComponent(cat)}">${cat}</a>`).join("<br>");
     
      // Creator cell: each creator linked to filtered results by creator
      row.insertCell(4).innerHTML = item.creators.map(cid => `<a href="diagrams.html?creator=${encodeURIComponent(cid)}">${cid}</a>`).join("<br>");
    });

    // Update pagination controls (buttons) to reflect current page and total pages
    updatePagination(page);
  }
}

// Build and populate dropdown filter options for category and creator based on loaded data
function populateFilterOptions(data) {
  const categorySet = new Set();
  const creatorSet = new Set();

  // Extract unique categories and creator names from the raw data
  data.diagrams.forEach(diagram => {
    diagram.categories.forEach(cat => {
      // Format categories consistently (capitalize words, replace dashes)
      const formattedCategory = cat.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
      categorySet.add(formattedCategory);
    });
    diagram.creatorId.forEach(id => {
      // Find creator name by ID and add if found
      const creator = data.creators.find(c => c.id === id);
      if (creator) creatorSet.add(creator.name);
    });
  });

  // Populate category dropdown: first option is "All Categories"
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

  // Populate creator dropdown: first option is "All Creators"
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

// Apply all filters based on dropdown selections and update the table
function filterAll() {
  // Retrieve current filter values from dropdown elements
  const difficulty = document.getElementById("filterDifficulty").value;
  const category = document.getElementById("filterCategory").value;
  const creator = document.getElementById("filterCreator").value;

  // Construct query parameters based on active filters
  const params = new URLSearchParams();
  // Add parameters only if they are not set to "all"
  if (difficulty !== "all") params.set("difficulty", difficulty);
  if (category !== "all") params.set("category", category);
  if (creator !== "all") params.set("creator", creator);

  // Update the URL in the browser without reloading the page
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);

  // Update the canonical link tag for SEO purposes
  updateCanonicalURL();

  // Filter the full dataset based on selected criteria
  filteredData = fullData.filter(item => {
    const matchesDifficulty = (difficulty === "all" || item.difficulty === difficulty);
    const matchesCategory = (category === "all" || item.categories.includes(category));
    const matchesCreator = (creator === "all" || item.creators.includes(creator));
    return matchesDifficulty && matchesCategory && matchesCreator;
  });

  // Display the number of filtered results
  document.getElementById("filteredCount").textContent = filteredData.length;

  // Sort filtered data by name and show the first page
  filteredData = sortByName(filteredData);
  changePage(1);
}

// Update pagination buttons and display current page info
function updatePagination(currentPage) {
  const pageCount = Math.ceil(filteredData.length / ROWS_PER_PAGE); // Calculate total pages
  const paginationContainerUpper = document.getElementById("paginationUpper");
  const paginationContainerLower = document.getElementById("paginationLower");

  // Clear existing pagination buttons
  paginationContainerUpper.innerHTML = "";
  paginationContainerLower.innerHTML = "";

  if (pageCount === 0) return; // Don't display pagination if no results

  paginationContainerUpper.innerHTML = "Page: ";
  paginationContainerLower.innerHTML = "Page: ";

  // Helper function to create a styled pagination button
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

  // Add "first" and "previous" navigation buttons
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

  // Calculate range of page numbers to display
  const maxVisiblePages = 9;
  const halfWindow = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  let endPage = Math.min(pageCount, currentPage + halfWindow);

  // Adjust range if near beginning or end of pagination
  if (endPage - startPage + 1 < maxVisiblePages) {
    if (startPage === 1) {
      endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
    } else if (endPage === pageCount) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
  }

  // Add ellipses if needed to indicate skipped pages
  if (startPage > 1) {
    paginationContainerUpper.appendChild(document.createTextNode(" …"));
    paginationContainerLower.appendChild(document.createTextNode(" …"));
  }

  // Create numbered page buttons
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

  // Add "next" and "last" navigation buttons
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

// Change to a specific page in the paginated results
function changePage(page) {
  currentPage = page;
  displayTable(currentPage); // Refresh the table display

  // Get current filter values again
  const difficulty = document.getElementById("filterDifficulty").value;
  const category = document.getElementById("filterCategory").value;
  const creator = document.getElementById("filterCreator").value;

  // Build URL with current filters and page
  const params = new URLSearchParams();
  if (difficulty !== "all") params.set("difficulty", difficulty);
  if (category !== "all") params.set("category", category);
  if (creator !== "all") params.set("creator", creator);
  if (page > 1) params.set("page", page); // Avoid cluttering URL with page=1

  // Update browser URL
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);

  // Update canonical and SEO meta tags
  updateCanonicalURL();
  updateMetaTags(currentPage, difficulty, category, creator);
}

// Update the page's meta tags for SEO based on filters and page
function updateMetaTags(page, difficulty, category, creator) {
  const titleBase = "NewOrigami - Archive of Diagrams";
  const parts = [];

  if (difficulty !== "all") parts.push(capitalize(difficulty) + " Difficulty");
  if (category !== "all") parts.push(`Category: ${category}`);
  if (creator !== "all") parts.push(`By ${creator}`);
  if (page > 1) parts.push(`Page ${page}`);

  // Set the full document title
  const fullTitle = `${titleBase} - ${parts.join(" - ") || "All Diagrams"}`;
  document.title = fullTitle;

  // Set or create the meta description tag
  const description = `Explore ${titleBase.toLowerCase()}${parts.length ? " filtered by " + parts.join(", ") : ""}.`;
  let metaDesc = document.querySelector("meta[name=\"description\"]");
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = description;
}

// Update or insert the canonical link tag for SEO
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

// Capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate structured JSON-LD data for a diagram for SEO
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
    "url": diagram.download,  // Direct link to the diagram PDF
    "thumbnailUrl": diagram.image,
    "publisher": {
      "@type": "Organization",
      "name": "Logic Diagrams"
    }
  };

  return JSON.stringify(jsonLD);
}

// Initialize table display when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeTable);

// Log when the script is loaded
console.log("paginationAll.js loaded");
