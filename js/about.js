// about.js

// Example "files" with title and content
const aboutFiles = [
  { title: "test1", content: "<p>test.</p>" },
  { title: "test2", content: "<p>test2.</p>" },
  { title: "test3", content: "<p>test3.</p>" }
];

// Function to render files in the About Us file list
function renderAboutFiles() {
  const fileList = document.getElementById('about-file-list');
  fileList.innerHTML = ''; // Clear existing

  aboutFiles.forEach((file, index) => {
    const fileDiv = document.createElement('div');
    fileDiv.classList.add('about-file');
    fileDiv.textContent = file.title;
    fileDiv.style.cursor = 'pointer';

    // Click to show content
    fileDiv.addEventListener('click', () => {
      document.getElementById('person-content').innerHTML = file.content;
    });

    fileList.appendChild(fileDiv);
  });
}

// Run on script load
renderAboutFiles();
