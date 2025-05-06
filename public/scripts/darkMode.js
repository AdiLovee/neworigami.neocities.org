function handleHover(button, isHover) {
  const darkMode = localStorage.getItem('darkMode');
  if (isHover) {
    button.style.backgroundColor = darkMode === 'enabled'
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.1)';
  } else {
    button.style.backgroundColor = 'transparent';
  }
}

window.onload = function () {
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
  }
};

function darkModeToggle() {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
  } else {
    localStorage.setItem("darkMode", "disabled");
  }
}