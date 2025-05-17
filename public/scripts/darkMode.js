function handleHover(button, isHover) {
  const darkMode = localStorage.getItem("darkMode");
  if (isHover) {
    button.style.backgroundColor = darkMode === "enabled"
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.1)";
  } else {
    button.style.backgroundColor = "transparent";
  }
}

window.onload = function () {
  if (localStorage.getItem("darkMode") === "enabled") {
    document.documentElement.style.setProperty("--bg", "var(--dark-bg-color)");
    document.documentElement.style.setProperty("--fg", "var(--off-white)");
  }
};

function darkModeToggle() {
  if (document.documentElement.style.getPropertyValue("--bg") !== "var(--dark-bg-color)") {
    document.documentElement.style.setProperty("--bg", "var(--dark-bg-color)");
    document.documentElement.style.setProperty("--fg", "var(--off-white)");
    localStorage.setItem("darkMode", "enabled");
  } else {
    document.documentElement.style.setProperty("--bg", "var(--light-bg-color)");
    document.documentElement.style.setProperty("--fg", "var(--near-black)");
    localStorage.setItem("darkMode", "disabled");
  }
}

const BUTTON = document.getElementById("darkMode");
BUTTON.innerHTML = `
  Dark/Light Toggle: 
  <button 
    id="theme-toggle"
    style="
      background-color: transparent; 
      border: none;
      color: inherit; 
      cursor: pointer; 
      transition: background-color 0.2s;"
    onmouseover="handleHover(this, true)"
    onmouseout="handleHover(this, false)"
    onclick="darkModeToggle()"
  >
    🌒/☀️
  </button>
`;