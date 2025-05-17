function shuffleArray(array) {
  const arr = array.slice(); // clone
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function encodeQueryParam(str) {
  return encodeURIComponent(str).replace(/%20/g, '+');
}

function getRandomDiagramHTML(diagram, creators) {
  const creatorNames = diagram.creatorId.map(id => {
    const creator = creators.find(c => c.id === id);
    return creator ? creator.name : "Unknown";
  });

  const creatorsHTML = creatorNames.map(name => {
    const queryName = encodeQueryParam(name);
    return `<a href="./diagrams.html?creator=${queryName}">${name}</a>`;
  }).join(", ");

  const categoriesRaw = diagram.categories.length > 0 ? diagram.categories : ["Uncategorized"];

  const categoriesHTML = categoriesRaw.map(catRaw => {
    const displayCat = catRaw
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const linkCat = encodeQueryParam(displayCat);

    return `<a href="./diagrams.html?category=${linkCat}">${displayCat}</a>`;
  }).join(", ");

  const title = diagram.title;
  const filename = diagram.filename;
  const difficulty = diagram.difficulty;

  return `
    <div class="featured-diagram" style="display: flex; gap: 1rem; align-items: flex-start;">
      <div class="thumbnail">
        <a href="./assets/diagrams/${filename}.pdf" target="_blank" rel="noopener noreferrer">
          <img src="./assets/thumbnails/${filename}.gif" alt="${filename}.gif" style="max-width: 200px; height: auto;">
        </a>
      </div>
      <div class="diagram-info" style="margin: 0;">
        <h4 style="margin: 0;">${title}</h4>
        <p style="margin: 0;"><strong>Difficulty:</strong> ${difficulty}</p>
        <p style="margin: 0;">
          <strong>Category:</strong> 
          ${categoriesHTML}
        </p>
        <p style="margin: 0;">
          <strong>Creator:</strong> 
          ${creatorsHTML}
        </p>
      </div>
    </div>
  `;
}

let diagrams = [];
let creators = [];

// Load data once
fetch('./data/diagramDict.json')
  .then(response => response.json())
  .then(data => {
    diagrams = data.diagrams;
    creators = data.creators;
  })
  .catch(error => {
    console.error("Error loading diagrams data:", error);
  });

document.getElementById('random-diagram-btn').addEventListener('click', () => {
  if (diagrams.length === 0) {
    alert("Diagram data is still loading, please try again shortly.");
    return;
  }

  // Get shuffle data from localStorage
  let shuffledOrder = JSON.parse(localStorage.getItem('randomDiagramOrder'));
  let currentIndex = parseInt(localStorage.getItem('randomDiagramIndex'), 10);

  // Initialize if missing or invalid
  if (!Array.isArray(shuffledOrder) || shuffledOrder.length !== diagrams.length) {
    shuffledOrder = shuffleArray(diagrams.map((_, i) => i));
    currentIndex = 0;
  }
  if (isNaN(currentIndex)) currentIndex = 0;

  // Pick diagram
  const diagram = diagrams[shuffledOrder[currentIndex]];

  // Display
  const html = getRandomDiagramHTML(diagram, creators);
  document.getElementById('random-diagram-display').innerHTML = html;

  console.log(`Showing diagram index ${currentIndex}: ${diagram.title}`);

  // Increment and reset if needed
  currentIndex++;
  if (currentIndex >= diagrams.length) {
    shuffledOrder = shuffleArray(diagrams.map((_, i) => i));
    currentIndex = 0;
  }

  // Save state
  localStorage.setItem('randomDiagramOrder', JSON.stringify(shuffledOrder));
  localStorage.setItem('randomDiagramIndex', currentIndex.toString());
});
