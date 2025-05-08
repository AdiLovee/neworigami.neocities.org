fetch('./data/version.json?v=' + Date.now())
.then(response => response.json())
.then(({ htmlVersion }) => {
  const current = localStorage.getItem('htmlVersion');
  if (current !== htmlVersion) {
    localStorage.setItem('htmlVersion', htmlVersion);
    location.reload(true); // Reloads from server
  }
});