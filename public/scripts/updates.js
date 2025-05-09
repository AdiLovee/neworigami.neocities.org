async function loadMarkdownFile(path) {
  const response = await fetch(path);
  return await response.text();
}

function formatUpdateContent(markdown) {
  // Convert markdown to HTML
  return marked.parse(markdown);
}

async function loadRecentUpdates() {
  const container = document.getElementById('updates-container');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  try {
    const response = await fetch('./updates/manifest.json');
    const filenames = await response.json();
    const updateFiles = filenames
      .filter(name => /^\d{4}-\d{2}-\d{2}\.md$/.test(name))
      .map(name => ({
        filename: name,
        date: new Date(name.replace('.md', ''))
      }))
      .filter(update => update.date > thirtyDaysAgo)
      .sort((a, b) => b.date - a.date);
    if (updateFiles.length === 0) {
      container.innerHTML = '<p class="no-updates">No updates in the last 30 days.</p>';
      return;
    }
    container.innerHTML = '';
    for (const file of updateFiles) {
      const content = await loadMarkdownFile(`./updates/${file.filename}`);
      const dateStr = file.date.toISOString().split('T')[0];
      const updateItem = document.createElement('div');
      updateItem.className = 'update-item';
      updateItem.innerHTML = `
        <div class="update-header">
          <span class="update-date">${dateStr}</span>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="update-content">
          <div class="update-text">${formatUpdateContent(content)}</div>
        </div>
      `;
      container.appendChild(updateItem);
      const header = updateItem.querySelector('.update-header');
      const contentDiv = updateItem.querySelector('.update-content');
      const toggleIcon = updateItem.querySelector('.toggle-icon');
      header.addEventListener('click', () => {
        const isShowing = contentDiv.classList.toggle('show');
        toggleIcon.textContent = isShowing ? '▲' : '▼';
      });
      contentDiv.classList.remove('show');
    }
  } catch (error) {
    console.error('Error loading updates:', error);
    container.innerHTML = '<p class="error">Failed to load updates.</p>';
  }
}
loadRecentUpdates();

console.log("updates.js loaded");