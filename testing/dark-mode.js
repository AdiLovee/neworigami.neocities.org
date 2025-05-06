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