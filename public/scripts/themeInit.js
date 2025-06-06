// Immediately sets theme class before HTML render
(function() {
  const storedPreference = localStorage.getItem("darkMode");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  //Apply dark mode if enabled in storage or no preference but system pref is dark
  if (storedPreference === "enabled" || (storedPreference === null && prefersDark)) {
    document.documentElement.style.setProperty("--bg", "var(--dark-bg-color)");
    document.documentElement.style.setProperty("--fg", "var(--off-white)");
  }
})();