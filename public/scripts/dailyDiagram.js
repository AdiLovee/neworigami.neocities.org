function encodeQueryParam(str) {
  return encodeURIComponent(str).replace(/%20/g, '+');
}

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

fetch('./data/diagramDict.json')
  .then(response => response.json())
  .then(data => {
    const diagrams = data.diagrams;
    const creators = data.creators;

    const storedDiagram = JSON.parse(localStorage.getItem('diagramOfTheDay'));
    const today = getTodayDateString();

    let selectedDiagram;

    if (storedDiagram && storedDiagram.date === today) {
      selectedDiagram = storedDiagram.diagram;
    } else {
      selectedDiagram = diagrams[Math.floor(Math.random() * diagrams.length)];
      localStorage.setItem('diagramOfTheDay', JSON.stringify({
        date: today,
        diagram: selectedDiagram
      }));
    }

    // --- Handle multiple creators ---
    const creatorNames = selectedDiagram.creatorId.map(id => {
      const creator = creators.find(c => c.id === id);
      return creator ? creator.name : "Unknown";
    });

    // Link creator names: spaces to plus signs, URL-encoded
    const creatorsHTML = creatorNames.map(name => {
      const queryName = encodeQueryParam(name);
      return `<a href="./diagrams.html?creator=${queryName}">${name}</a>`;
    }).join(", ");

    // --- Handle multiple categories ---
    const categoriesRaw = selectedDiagram.categories.length > 0 ? selectedDiagram.categories : ["Uncategorized"];

    // Capitalize and link categories with spaces replaced by plus signs
    const categoriesHTML = categoriesRaw.map(catRaw => {
    const displayCat = catRaw
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

      // For URL: capitalize each word and replace spaces with plus signs
      const linkCat = encodeQueryParam(displayCat);

      return `<a href="./diagrams.html?category=${linkCat}">${displayCat}</a>`;
    }).join(", ");

    const title = selectedDiagram.title;
    const filename = selectedDiagram.filename;
    const difficulty = selectedDiagram.difficulty;

    const diagramHTML = `
      <div class="featured-diagram">
        <h2 style="margin-bottom: 1rem;">Diagram of the Day</h2>
        <div style="display: flex; gap: 1rem; align-items: flex-start;">
          <div class="thumbnail">
            <a href="./assets/diagrams/${filename}.pdf">
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
      </div>
    `;

    document.getElementById('diagram-of-the-day').innerHTML = diagramHTML;
  })
  .catch(error => {
    console.error("Error loading diagram of the day:", error);
  });
