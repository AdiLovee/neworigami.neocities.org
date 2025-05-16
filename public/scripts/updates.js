// Asynchronously loads a markdown file from the given path and returns its text content
async function loadMarkdownFile(path) {
  const response = await fetch(path);        // Fetch the file from the given path
  return await response.text();               // Return the file content as plain text
}

// Converts markdown string to HTML using the marked library
function formatUpdateContent(markdown) {
  // Convert markdown to HTML
  return marked.parse(markdown);
}

// Loads recent updates (markdown files) from the last 30 days and renders them in the page
async function loadRecentUpdates() {
  const container = document.getElementById("updates-container"); // Get the container where updates will be displayed

  // Calculate the date 30 days ago from today
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // Fetch the manifest.json that lists all markdown update files
    const response = await fetch("./updates/manifest.json");
    const filenames = await response.json();  // Parse JSON array of filenames

    // Filter filenames to include only markdown files named like YYYY-MM-DD.md
    // Then map them to objects with filename and corresponding date
    // Then filter to keep only those updates from the last 30 days
    // Finally, sort them by date descending (newest first)
    const updateFiles = filenames
      .filter(name => /^\d{4}-\d{2}-\d{2}\.md$/.test(name))
      .map(name => ({
        filename: name,
        date: new Date(name.replace(".md", ""))
      }))
      .filter(update => update.date > thirtyDaysAgo)
      .sort((a, b) => b.date - a.date);

    // If no recent updates found, show a placeholder message
    if (updateFiles.length === 0) {
      container.innerHTML = "<p class=\"no-updates\">No updates in the last 30 days.</p>";
      return;
    }

    container.innerHTML = "";  // Clear any existing content in the container

    // Loop through each update file, load its content, and create an update item in the DOM
    for (const file of updateFiles) {
      const content = await loadMarkdownFile(`./updates/${file.filename}`); // Load markdown content
      const dateStr = file.date.toISOString().split("T")[0];                // Format date as YYYY-MM-DD

      // Create a container div for this update
      const updateItem = document.createElement("div");
      updateItem.className = "update-item";

      // Set the inner HTML for the update item: header with date and toggle icon,
      // and the update content converted from markdown to HTML
      updateItem.innerHTML = `
        <div class="update-header">
          <span class="update-date">${dateStr}</span>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="update-content">
          <div class="update-text">${formatUpdateContent(content)}</div>
        </div>
      `;

      // Add the update item to the container
      container.appendChild(updateItem);

      // Set up the toggle functionality for showing/hiding the update content
      const header = updateItem.querySelector(".update-header");
      const contentDiv = updateItem.querySelector(".update-content");
      const toggleIcon = updateItem.querySelector(".toggle-icon");

      // When the header is clicked, toggle the visibility of the content and update the icon
      header.addEventListener("click", () => {
        const isShowing = contentDiv.classList.toggle("show");
        toggleIcon.textContent = isShowing ? "▲" : "▼";
      });

      // Initially hide the update content
      contentDiv.classList.remove("show");
    }
  } catch (error) {
    // If any error occurs during fetching or processing, log it and show an error message
    console.error("Error loading updates:", error);
    container.innerHTML = "<p class=\"error\">Failed to load updates.</p>";
  }
}

// Trigger the loading of recent updates as soon as the script runs
loadRecentUpdates();

// Log to the console that the updates script has loaded
console.log("updates.js loaded");
