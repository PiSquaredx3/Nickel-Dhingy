const blogContent = {
  "post1": "<h2>Post 1</h2><p>This is the content for post1.</p>",
  "post2": "<h2>Post 2</h2><p>This is the content for post2.</p>",
  "post3": "<h2>Post 3</h2><p>This is the content for post3.</p>",
};

document.addEventListener("DOMContentLoaded", () => {
  const blogRows = document.querySelectorAll("#blog-file-list .file-row");
  const blogDiv = document.getElementById("blog-content");

  blogRows.forEach(row => {
    row.style.cursor = "pointer";
    row.addEventListener("click", () => {
      const postName = row.querySelector(".file-col.name").textContent.trim();
      blogDiv.innerHTML = blogContent[postName] || "<p>No content available.</p>";
      blogRows.forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");
    });
  });
});
