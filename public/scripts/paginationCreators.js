import { fetchData, sortByName, displayError, ROWS_PER_PAGE } from "./shared.js"; // Shared utility functions and constants from shared.js
import { renderPagination } from "./pagination.js";                               // Shared pagination helpers


// Constants
let currentPage = 1;     // Current pagination page
let diagramDict = { creators: [] }; // Data container for creator info

// Load data from JSON and initialize the table
function loadDiagramData() {
  fetchData()
    .then(data => {
      // Sort by creators alphabetically then display first page
      sortByName(data.creators);
      diagramDict = data;
      displayTable(currentPage);
    })
    .catch(error => {
      console.error("Error loading diagramDict.json:", error);
      // Display user-friendly error message in case of failure
      displayError("tableContainer", "There was an issue loading the data. Please try again.");
    });
}

// Display the table based on the current page number
function displayTable(page) {
  const table = document.getElementById("tablePaginatedCreator");

  // Calculate slice range for current page
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;

  // Get the subset of creators for the current page
  const creatorsData = diagramDict.creators.slice(startIndex, endIndex);

  // Clear any existing table rows
  table.innerHTML = ``;

  // Add rows for each creator entry
  creatorsData.forEach(item => {
    const row = table.insertRow();

    // Column 1: Creator name with link to filtered diagrams page
    const nameCell = row.insertCell(0);
    nameCell.innerHTML = `<a href="./diagrams.html?creator=${encodeURIComponent(item.name)}">${item.name}</a>`;
    nameCell.style.width = "250px";

    // Column 2: Optional link to creator's site
    const siteCell = row.insertCell(1);
    siteCell.innerHTML = item.site
      ? `<a href="${item.site}" target="_blank" rel="noopener noreferrer">[Site]</a>`
      : "[Site]";

    // Column 3: Optional link to creator's YouTube
    const youtubeCell = row.insertCell(2);
    youtubeCell.innerHTML = item.youtube
      ? `<a href="${item.youtube}" target="_blank" rel="noopener noreferrer">[YouTube]</a>`
      : "[YouTube]";
  });

  // Update pagination controls based on current page
  updatePagination(page);
}

// Generate and display pagination controls
function updatePagination(currentPage) {
  const pageCount = Math.ceil(diagramDict.creators.length / ROWS_PER_PAGE);
  const paginationContainer = document.getElementById("pagination");

  renderPagination(paginationContainer, currentPage, pageCount, (page) => {
    displayTable(page);
  });
}

// Start loading and displaying data when the page is ready
loadDiagramData();