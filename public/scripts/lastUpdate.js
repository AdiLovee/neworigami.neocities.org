fetch("./updates/manifest.json")
  .then(res => res.json())
  .then(data => {
    const mostRecentRaw = data
    .map(entry => entry.replace(".md", ""))
    .sort((a, b) => new Date(b) - new Date(a))[0];

    // Parse as local date
    const [year, month, day] = mostRecentRaw.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month is 0-based

    const formattedDate = localDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    document.getElementById("lastUpdate").textContent = formattedDate;
  })
  .catch(err => {
    console.error("Failed to fetch manifest:", err);
    document.getElementById("lastUpdate").textContent = "Unavailable";
  });