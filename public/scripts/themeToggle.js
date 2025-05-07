const modeBtn = document.getElementById('theme-toggle');

function darkModeToggle() {
  document.documentElement.classList.toggle('dark-mode');
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');

  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
};

function handleHover(isHover) {
  const darkMode = localStorage.getItem('darkMode') === 'enabled' ||
                  (localStorage.getItem('darkMode') === null &&
                  window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isHover) {
    modeBtn.style.backgorundColor = darkMode === 'enabled'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.1)';
  } else {
    modeBtn.style.backgroundColor = 'transparent';
  }
};

// Initialized based on preference
function initializeTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedPreference = localStorage.getItem('darkMode');
  
  const shouldEnable = storedPreference === 'enabled' || 
                      (storedPreference === null && prefersDark);
  
  document.documentElement.classList.toggle('dark-mode', shouldEnable);
  document.body.classList.toggle('dark-mode', shouldEnable);
};

document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();

  if (modeBtn) {
    modeBtn.addEventListener('click', darkModeToggle);
    modeBtn.addEventListener('mouseover', handleHover(true));
    modeBtn.addEventListener('mouseout', handleHover(false));
  }
});