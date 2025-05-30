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

const blogPosts = [
  {
    title: 'Test Post 1',
    content: 'This is the content of Test Post 1.',
    date: '2025-05-28'
  },
  {
    title: 'Test Post 2',
    content: 'This is the content of Test Post 2.',
    date: '2025-05-27'
  }
];

const blogList = document.querySelector('.blog-file-list');
const postContent = document.getElementById('post-content');
blogPosts.forEach((post, index) => {
  const item = document.createElement('div');
  item.style.display = 'flex';
  item.style.justifyContent = 'space-between';
  item.style.alignItems = 'center';
  item.style.padding = '4px';
  item.style.cursor = 'pointer';

  const left = document.createElement('div');
  left.style.display = 'flex';
  left.style.alignItems = 'center';

  const icon = document.createElement('img');
  icon.src = 'assets/icons/79.png';
  icon.alt = 'File Icon';
  icon.style.width = '16px';
  icon.style.height = '16px';
  icon.style.marginRight = '8px';

  const title = document.createElement('span');
  title.classList.add('blog-post-title');
  title.textContent = post.title;

  left.appendChild(icon);
  left.appendChild(title);

  const date = document.createElement('span');
  date.style.fontSize = '11px';
  date.style.color = '#666';
  date.textContent = post.date;

  item.appendChild(left);
  item.appendChild(date);

  item.addEventListener('click', () => {
    postContent.innerHTML = `<p>${post.content}</p>`;
  });

  blogList.appendChild(item);
});

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
