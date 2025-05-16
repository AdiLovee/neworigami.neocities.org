// Import shared utility functions and constants from shared.js
import { fetchData, sortByName, displayError } from "./shared.js";

// Constants
const ROWSPERPAGE = 15; // Number of rows to show per page
let currentPage = 1;     // Current pagination page
let diagramDict = { creators: [] }; // Data container for creator info

// Load data from JSON and initialize the table
function loadDiagramData() {
  fetchData()
    .then(data => {
      // Sort creators alphabetically by name
      sortByName(data.creators);
      diagramDict = data;
      // Display the first page of results
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
  const table = document.getElementById("tablePaginated");

  // Calculate slice range for current page
  const startIndex = (page - 1) * ROWSPERPAGE;
  const endIndex = startIndex + ROWSPERPAGE;

  // Get the subset of creators for the current page
  const creatorsData = diagramDict.creators.slice(startIndex, endIndex);

  // Clear any existing table rows
  table.innerHTML = ``;

  // Add rows for each creator entry
  creatorsData.forEach(item => {
    const row = table.insertRow();

    // Column 1: Creator name with link to filtered diagrams page
    const nameCell = row.insertCell(0);
    nameCell.innerHTML = `<a href="./diagrams?creator=${encodeURIComponent(item.name)}">${item.name}</a>`;
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
  const pageCount = Math.ceil(diagramDict.creators.length / ROWSPERPAGE);
  const paginationContainer = document.getElementById("pagination");

  // Clear existing pagination
  paginationContainer.innerHTML = "Page: ";

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
    
    // Highlight current page button
    if (isCurrent) {
      btn.style.fontWeight = "bold";
      btn.style.fontSize = "1.2em";
    }

    // Assign click handler if button is not disabled
    if (!disabled) {
      btn.onclick = onClick;
    }

    return btn;
  }

  // "Previous" button
  paginationContainer.appendChild(
    createButton("←", () => displayTable(currentPage - 1), currentPage === 1)
  );

  // Page number buttons
  for (let i = 1; i <= pageCount; i++) {
    paginationContainer.appendChild(
      createButton(i, () => displayTable(i), false, i === currentPage)
    );
  }

  // "Next" button
  paginationContainer.appendChild(
    createButton("→", () => displayTable(currentPage + 1), currentPage === pageCount)
  );
}

// Start loading and displaying data when the page is ready
loadDiagramData();
