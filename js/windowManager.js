// windowManager.js

// --- Window dragging support ---
function makeDraggable(el) {
  let isDragging = false;
  let offsetX, offsetY;

  const header = el.querySelector('.window-header');
  if (!header) return;

  header.style.cursor = 'move';

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    el.style.position = 'absolute';
    el.style.zIndex = bringToFront(el);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    el.style.left = (e.clientX - offsetX) + 'px';
    el.style.top = (e.clientY - offsetY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

let topZIndex = 1000;
function bringToFront(el) {
  topZIndex++;
  el.style.zIndex = topZIndex;
  return topZIndex;
}

// --- Window elements ---
const aboutWindow = document.getElementById('about-window');
const blogWindow = document.getElementById('blog-window');
const trashWindow = document.getElementById('trash-window');

const aboutIcon = document.querySelector('.desktop-icon img[alt="About Us"]').parentElement;
const blogIcon = document.querySelector('.desktop-icon img[alt="Blog"]').parentElement;
const trashIcon = document.getElementById('trash-icon');

const allWindows = [aboutWindow, blogWindow, trashWindow];

// --- Close buttons ---
aboutWindow.querySelector('.close-btn').addEventListener('click', () => {
  playClickSound();
  aboutWindow.style.display = 'none';
});
blogWindow.querySelector('.close-btn').addEventListener('click', () => {
  playClickSound();
  blogWindow.style.display = 'none';
});
trashWindow.querySelector('.close-btn').addEventListener('click', () => {
  playClickSound();
  trashWindow.style.display = 'none';
});

// --- Open window helper ---
function openWindow(win, left = '100px', top = '100px') {
  playClickSound();
  win.style.display = 'flex';
  win.style.left = left;
  win.style.top = top;
  bringToFront(win);
}

// --- Icon click handlers ---
aboutIcon.addEventListener('click', () => openWindow(aboutWindow, '100px', '100px'));
blogIcon.addEventListener('click', () => openWindow(blogWindow, '120px', '120px'));
trashIcon.addEventListener('click', () => openWindow(trashWindow, '140px', '140px'));

// --- Make all windows draggable ---
allWindows.forEach(win => makeDraggable(win));

// --- Blog posts data ---
const blogPosts = {
  post1: `<h4>Welcome!</h4><p>We're currently under construction right now so uh come back later</p>`,
  post2: `<h4>Second Post</h4><p>This is another blog test post content.</p>`
};

// --- About people data ---
const aboutPeople = {
  person1: `<h4>Person 1</h4><p>Details about person 1...</p>`,
  person2: `<h4>Person 2</h4><p>Details about person 2...</p>`
};

// --- Trash files data ---
const trashFilesData = {
  'example-image.png': { type: 'image' },
  'notes.txt': { type: 'text' }
};

// --- Blog post selection ---
const postContentDiv = document.getElementById('post-content');
document.querySelectorAll('.blog-post-title').forEach(file => {
  file.addEventListener('click', () => {
    playClickSound();
    const postKey = file.dataset.post;
    if (blogPosts[postKey]) {
      postContentDiv.innerHTML = blogPosts[postKey];
    } else {
      postContentDiv.innerHTML = '<p>Post not found.</p>';
    }
  });
});

// --- About person selection ---
const personContentDiv = document.getElementById('person-content');
document.querySelectorAll('.about-file').forEach(file => {
  file.addEventListener('click', () => {
    playClickSound();
    const personKey = file.dataset.person;
    if (aboutPeople[personKey]) {
      personContentDiv.innerHTML = aboutPeople[personKey];
    } else {
      personContentDiv.innerHTML = '<p>Person not found.</p>';
    }
  });
});

// --- Trash file previews ---
const trashPreview = document.getElementById('trash-preview');
document.querySelectorAll('#trash-window .trash-file').forEach(file => {
  file.addEventListener('click', () => {
    const fileName = file.querySelector('.file-col.name').textContent.trim();
    const fileData = trashFilesData[fileName];

    if (!fileData) {
      trashPreview.innerHTML = `<p>Unknown file type.</p>`;
      return;
    }

    if (fileData.type === 'image') {
      trashPreview.innerHTML = `
        <h4>${fileName}</h4>
        <img src="assets/trash/${fileName}" alt="${fileName}" style="max-width:100%; max-height:300px;" />
      `;
    } else if (fileData.type === 'text') {
      fetch(`assets/trash/${fileName}`)
        .then(response => response.text())
        .then(text => {
          trashPreview.innerHTML = `
            <h4>${fileName}</h4>
            <pre style="white-space:pre-wrap; word-wrap:break-word;">${text}</pre>
          `;
        })
        .catch(() => {
          trashPreview.innerHTML = `<p>Unable to load the text file.</p>`;
        });
    }
  });
});
