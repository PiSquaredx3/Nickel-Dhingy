const aboutContent = {
  "test1": "<h2>Test 1</h2><p>This is the content for test1.</p>",
  "test2": "<h2>Test 2</h2><p>This is the content for test2.</p>",
  "test3": "<h2>Test 3</h2><p>This is the content for test3.</p>",
};


document.addEventListener("DOMContentLoaded", () => {
  const fileRows = document.querySelectorAll("#about-file-list .file-row");
  const contentDiv = document.getElementById("person-content");

  fileRows.forEach(row => {
    row.style.cursor = "pointer";
    row.addEventListener("click", () => {
      // Get file name text
      const fileName = row.querySelector(".file-col.name").textContent.trim();

      // Set content from aboutContent or default
      contentDiv.innerHTML = aboutContent[fileName] || "<p>No content available.</p>";

      // Highlight selected row
      fileRows.forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");
    });
  });
});
