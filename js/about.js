const aboutFiles = {
  "test1": "<p>test1.</p>",
  "test2": "<p>test2.</p>",
  "test3": "<p>test3.</p>"
};

function setupAboutFileClicks() {
  const fileRows = document.querySelectorAll('#about-file-list .file-row');
  fileRows.forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      // Get the file name from the .file-col.name div inside this row
      const title = row.querySelector('.file-col.name').textContent.trim();
      const content = aboutFiles[title] || "<p>No content available.</p>";
      document.getElementById('person-content').innerHTML = content;

      // Optional: Highlight selected row
      fileRows.forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
    });
  });
}

// Call this on page load or window open
setupAboutFileClicks();
