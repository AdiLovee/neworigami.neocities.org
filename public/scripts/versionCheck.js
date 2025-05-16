console.log("Loading versionCheck.js");

fetch("./data/versionManifest.json?v=" + Date.now())
  .then(response => response.json())
  .then(versionData => {
    let versionMismatch = false;

    // Loop through each file in versionData
    Object.keys(versionData).forEach(file => {
      if (file === "*.gif") {
        // Special case: update all .gif thumbnails
        const gifVersion = versionData[file];
        const gifImages = document.querySelectorAll("img[src$=\".gif\"]");
        gifImages.forEach(img => {
          const srcBase = img.src.split("?")[0]; // Remove any existing version param
          img.src = `${srcBase}?v=${gifVersion}`;
          console.log(`Updated GIF image: ${srcBase}`);
        });
        localStorage.setItem("*.gif", gifVersion);
        versionMismatch = true;
        return;
      }
      if (file === "*.pdf") {
        // Special case: update all .pdf files
        const pdfVersion = versionData[file];
        const pdfImages = document.querySelectorAll("img[src$=\".pdf\"]");
        pdfImages.forEach(img => {
          const srcBase = img.src.split("?")[0]; // Remove any existing version param
          img.src = `${srcBase}?v=${pdfVersion}`;
          console.log(`Updated PDF files: ${srcBase}`);
        });
        localStorage.setItem("*.pdf", pdfVersion);
        versionMismatch = true;
        return;
      }
    
      if (file !== "htmlVersion") {
        const currentVersion = localStorage.getItem(file);
        const newVersion = versionData[file];
    
        console.log(`[${file}] current: ${currentVersion || "none"}, new: ${newVersion}`);
    
        if (currentVersion !== newVersion) {
          localStorage.setItem(file, newVersion);
          versionMismatch = true;
          reloadResource(file, newVersion);
        }
      }
    });
    // If any resource mismatches are found, reload the page to reflect HTML version changes
    if (versionMismatch) {
      localStorage.setItem("htmlVersion", versionData.htmlVersion);
      console.log("Version mismatch found. Relevant files updated.");
    } else {
      console.log("All versions match. No updates needed.");
    }
  })
  .catch(error => {
    console.error("Error fetching versionManifest.json:", error);
});

// Function to reload specific resources (JS, CSS, or JSON)
function reloadResource(file, version) {
  const resourceType = getFileType(file);

  if (resourceType === "js") {
    // Remove and reload the script
    const existingScript = document.querySelector(`script[src*="${file}"]`);
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.src = `${file}?v=${version}`; // Append version query for cache-busting
    script.defer = true;
    document.head.appendChild(script);
    console.log(`Reloaded script: ${file}`);
  } else if (resourceType === "css") {
    // Remove and reload the stylesheet
    const existingLink = document.querySelector(`link[href*="${file}"]`);
    if (existingLink) existingLink.remove();

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${file}?v=${version}`; // Append version query for cache-busting
    document.head.appendChild(link);
    console.log(`Reloaded stylesheet: ${file}`);
  } else if (resourceType === "json") {
    fetch(`${file}?v=${version}`)
      .then(response => response.json())
      .then(jsonData => {
        console.log(`Fetched new JSON data for ${file}:`, jsonData);
      })
      .catch(error => console.error(`Error fetching ${file}:`, error));
  
  } else if (resourceType === "gif") {
    const imageElements = document.querySelectorAll(`img[src*="${file}"]`);
    if (imageElements.length > 0) {
      imageElements.forEach(img => {
        const newSrc = `${file}?v=${version}`;
        img.src = newSrc;
        console.log(`Updated GIF image: ${file}`);
      });
    } else {
      console.warn(`No <img> elements found for: ${file}`);
    }
  
  } else {
    console.warn(`Unknown file type for: ${file}`);
  }
  
}

// Helper function to determine the file type (js, css, json)
function getFileType(file) {
  if (file.endsWith(".js")) return "js";
  if (file.endsWith(".css")) return "css";
  if (file.endsWith(".json")) return "json";
  if (file.endsWith(".gif")) return "gif";
  return "unknown";
}