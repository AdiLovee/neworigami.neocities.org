// Holds pagination specific shared functions

/**
 * Creates a styled pagination button
 * @param {string} label - Button text (e.g., "←", "1", "→")
 * @param {Function} onClick - Click handler function
 * @param {boolean} disabled - Whether button is disabled
 * @param {boolean} isCurrent - Whether this is the current page
 * @returns {HTMLButtonElement}
 */

export function createPaginationButton(label, onClick, disabled = false, isCurrent = false) {
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

/**
 * Calculates what page numbers to display in pagination
 * @param {number} currentPage - Current page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {number} maxVisible - Max buttons to show (default 9)
 * @returns {{ start: number, end: number, showEllipsisStart: boolean, showEllipsesEnd: boolean }}
 */

export function calculatePageRange(currentPage, totalPages, maxVisible = 9) {
  const halfWindow = Math.floor(maxVisible / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  let endPage = Math.min(totalPages, currentPage + halfWindow);

  // Adjust range if near beginning or end
  if (endPage - startPage + 1 < maxVisible) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + maxVisible - 1);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
  }

  return {
    start: startPage,
    end: endPage,
    showEllipsisStart: startPage > 1,
    showEllipsesEnd: endPage < totalPages
  };
}

/**
 * Renders pagination controls into designated container
 * @param {HTMLElement} container - Element to append buttons to
 * @param {number} currentPage - Current page
 * @param {number} totalPages - Total pages
 * @param {Function} onPageChange - Handler for page changes
 * @param {Object} options - Optional config (prevLabel, nextLabel, etc.)
 */

export function renderPagination(container, currentPage, totalPages, onPageChange, options = {}) {
  const {
    prevLabel = "←",
    nextLabel = "→",
    firstLabel = "|←",
    lastLabel = "→|",
    ellipsis = "…"
  } = options;

  container.innerHTML = "Page: ";

  if (totalPages === 0) return;

  // First button
  container.appendChild(
    createPaginationButton(firstLabel, () => onPageChange(1), currentPage === 1)
  );

  // Previous button
  container.appendChild(
    createPaginationButton(prevLabel, () => onPageChange(currentPage - 1),  currentPage === 1)
  );

  // Calculate page range
  const range = calculatePageRange(currentPage, totalPages);

  // Ellipses at start
  if (range.showEllipsisStart) {
    container.appendChild(document.createTextNode(` ${ellipsis} `));
  }

  // Page number buttons
  for (let i = range.start; i <=range.end; i++) {
    container.appendChild(
      createPaginationButton(i, () => onPageChange(i), false, i === currentPage)
    );
  }

  // Ellipses at end
  if (range.showEllipsesEnd) {
    container.appendChild(document.createTextNode(` ${ellipsis} `));
  }

  // Next button
  container.appendChild(
    createPaginationButton(nextLabel, () => onPageChange(currentPage + 1), currentPage === totalPages)
  );

  // Last button
  container.appendChild(
    createPaginationButton(lastLabel, () => onPageChange(totalPages), currentPage === totalPages)
  );
}