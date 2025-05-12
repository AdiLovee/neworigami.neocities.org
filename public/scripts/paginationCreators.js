import { fetchData, sortByName, displayError } from "./shared.js";

const ROWSPERPAGE = 15;
let currentPage = 1;
let diagramDict = { creators: [] };

function loadDiagramData() {
  fetchData()
    .then(data => {
      sortByName(data.creators);
      diagramDict = data;
      displayTable(currentPage);
    })
    .catch(error => {
      console.error("Error loading diagramDict.json:", error);
      displayError("tableContainer", "There was an issue loading the data. Please try again.");
    });
}

function displayTable(page) {
  const table = document.getElementById("tablePaginated");
  const startIndex = (page - 1) * ROWSPERPAGE;
  const endIndex = startIndex + ROWSPERPAGE;
  const creatorsData = diagramDict.creators.slice(startIndex, endIndex);
  table.innerHTML = ``;
  creatorsData.forEach(item => {
    const row = table.insertRow();

    const nameCell = row.insertCell(0);
    nameCell.innerHTML = `<a href="./diagrams.html?creator=${encodeURIComponent(item.name)}">${item.name}</a>`;
    nameCell.style.width = "250px";

    const siteCell = row.insertCell(1);
    siteCell.innerHTML = item.site
      ? `<a href="${item.site}" target="_blank" rel="noopener noreferrer">[Site]</a>`
      : "[Site]";

    const youtubeCell = row.insertCell(2);
    youtubeCell.innerHTML = item.youtube
      ? `<a href="${item.youtube}" target="_blank" rel="noopener noreferrer">[YouTube]</a>`
      : "[YouTube]";
  });
  updatePagination(page);
}

function updatePagination(currentPage) {
  const pageCount = Math.ceil(diagramDict.creators.length / ROWSPERPAGE);
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
    createButton("←", () => displayTable(currentPage - 1), currentPage === 1)
  );
  for (let i = 1; i <= pageCount; i++) {
    paginationContainer.appendChild(
      createButton(i, () => displayTable(i), false, i === currentPage)
    );
  }
  paginationContainer.appendChild(
    createButton("→", () => displayTable(currentPage + 1), currentPage === pageCount)
  );
}

// Load the diagram data on page load
loadDiagramData();
