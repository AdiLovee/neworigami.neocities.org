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

        // Log current vs. new version
        console.log(`[${file}] current: ${currentVersion || 'none'}, new: ${newVersion}`);

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
      localStorage.setItem('htmlVersion', versionData.htmlVersion);
      console.log("Version mismatch found. Relevant files updated.");
    } else {
      console.log("All versions match. No updates needed.");
    }
  })
  .catch(error => {
    console.error('Error fetching version.json:', error);
});

// Function to reload specific resources (JS, CSS, or JSON)
function reloadResource(file, version) {
  const resourceType = getFileType(file);

  if (resourceType === 'js') {
    // Remove and reload the script
    const existingScript = document.querySelector(`script[src*="${file}"]`);
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.src = `${file}?v=${version}`; // Append version query for cache-busting
    script.defer = true;
    document.head.appendChild(script);
    console.log(`Reloaded script: ${file}`);
  } else if (resourceType === 'css') {
    // Remove and reload the stylesheet
    const existingLink = document.querySelector(`link[href*="${file}"]`);
    if (existingLink) existingLink.remove();

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${file}?v=${version}`; // Append version query for cache-busting
    document.head.appendChild(link);
    console.log(`Reloaded stylesheet: ${file}`);
  } else if (resourceType === 'json') {
    fetch(`${file}?v=${version}`)
      .then(response => response.json())
      .then(jsonData => {
        console.log(`Fetched new JSON data for ${file}:`, jsonData);
      })
      .catch(error => console.error(`Error fetching ${file}:`, error));
  } else {
    console.warn(`Unknown file type for: ${file}`);
  }
  
}

// Helper function to determine the file type (js, css, json)
function getFileType(file) {
  if (file.endsWith('.js')) return 'js';
  if (file.endsWith('.css')) return 'css';
  if (file.endsWith('.json')) return 'json';
  return 'unknown';
}