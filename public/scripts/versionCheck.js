console.log("Loading versionCheck.js");

fetch('./data/version.json?v=' + Date.now())
  .then(response => response.json())
  .then(versionData => {
    let versionMismatch = false;

    // Loop through each file in versionData
    Object.keys(versionData).forEach(file => {
      if (file !== "htmlVersion") { // Skip checking htmlVersion itself
        const currentVersion = localStorage.getItem(file);
        const newVersion = versionData[file];

        if (currentVersion !== newVersion) {
          localStorage.setItem(file, newVersion); // Update version in localStorage
          versionMismatch = true; // Flag to reload specific files

          // Reload the mismatched resource
          reloadResource(file, newVersion);
        }
      }
    });

    // If any resource mismatches are found, reload the page to reflect HTML version changes
    if (versionMismatch) {
      localStorage.setItem('htmlVersion', versionData.htmlVersion); // Update the main HTML version
    }
  })
  .catch(error => {
    console.error('Error fetching version.json:', error);
  });

// Function to reload specific resources (JS, CSS, or JSON)
function reloadResource(file, version) {
  let resourceType = getFileType(file);

  if (resourceType === 'js') {
    // Remove and reload the script
    const existingScript = document.querySelector(`script[src*="${file}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = `${file}?v=${version}`; // Append version query for cache-busting
    script.defer = true;
    document.head.appendChild(script);
  }
  else if (resourceType === 'css') {
    // Remove and reload the stylesheet
    const existingLink = document.querySelector(`link[href*="${file}"]`);
    if (existingLink) {
      existingLink.remove();
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${file}?v=${version}`; // Append version query for cache-busting
    document.head.appendChild(link);
  }
  else if (resourceType === 'json') {
    // You can manage JSON file refresh as well if needed
    fetch(`${file}?v=${version}`)
      .then(response => response.json())
      .then(jsonData => {
        console.log('New data from', file, jsonData);
        // Optionally do something with the updated JSON data here
      })
      .catch(error => console.error(`Error fetching ${file}:`, error));
  }
}

// Helper function to determine the file type (js, css, json)
function getFileType(file) {
  if (file.endsWith('.js')) return 'js';
  if (file.endsWith('.css')) return 'css';
  if (file.endsWith('.json')) return 'json';
  return 'unknown';
}
console.log("Version check complete, all files up-to-date")