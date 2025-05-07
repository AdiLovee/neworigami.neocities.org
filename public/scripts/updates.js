async function loadRecentUpdates() {
  const container = document.getElementById('updates-container');
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
      // Get directory listing
      const response = await fetch('./updates/');
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Process files
      const updateFiles = Array.from(doc.querySelectorAll('a[href$=".md"]'))
          .map(link => link.href.split('/').pop())
          .filter(filename => /^\d{4}-\d{2}-\d{2}\.md$/.test(filename))
          .map(filename => {
              const dateStr = filename.replace('.md', '');
              return {
                  filename,
                  date: new Date(dateStr)
              };
          })
          .filter(update => update.date > thirtyDaysAgo)
          .sort((a, b) => b.date - a.date);

      if (updateFiles.length === 0) {
          container.innerHTML = '<p class="no-updates">No updates in the last 30 days.</p>';
          return;
      }

      container.innerHTML = '';

      // Load each update
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
          
          // Add click handler
          const header = updateItem.querySelector('.update-header');
          const contentDiv = updateItem.querySelector('.update-content');
          const toggleIcon = updateItem.querySelector('.toggle-icon');
          
          header.addEventListener('click', () => {
              const isShowing = contentDiv.classList.toggle('show');
              toggleIcon.textContent = isShowing ? '▲' : '▼';
          });
          
          // Start collapsed
          contentDiv.classList.remove('show');
      }

  } catch (error) {
      console.error('Error loading updates:', error);
      container.innerHTML = '<p class="error">Failed to load updates.</p>';
  }
}

async function loadMarkdownFile(path) {
  const response = await fetch(path);
  return await response.text();
}

function formatUpdateContent(text) {
  // Simple line breaks and link conversion
  return text
      .replace(/\n/g, '<br>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
}

document.addEventListener('DOMContentLoaded', loadRecentUpdates);