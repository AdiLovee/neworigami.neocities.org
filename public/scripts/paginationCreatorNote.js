const ROWSPERPAGE = 15;
let currentPage = 1;
function displayTable(page) {
  const table = document.getElementById("tablePaginated");
  const startIndex = (page - 1) * ROWSPERPAGE;
  const endIndex = startIndex + ROWSPERPAGE;
  const slicedData = DATA.slice(startIndex, endIndex);
  table.innerHTML = `
    <tr>
      <th><u>↓</u></th>
      <th>Difficulty</th>
      <th>Name</th>
      <th>Category</th>
      <th>Notes</th>
    </tr>
    `;
  slicedData.forEach(item => {
    const row = table.insertRow();
    row.insertCell(0).innerHTML = item.download;
    const difficultyCell = row.insertCell(1);
    difficultyCell.innerHTML = item.difficulty;
    difficultyCell.style.textAlign = "center"; 
    row.insertCell(2).innerHTML = item.name;
    row.insertCell(3).innerHTML = item.category;
    row.insertCell(4).innerHTML = item.notes;
  });
  updatePagination(page);
}
function updatePagination(currentPage) {
  const pageCount = Math.ceil(DATA.length / ROWSPERPAGE);
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
displayTable(currentPage);