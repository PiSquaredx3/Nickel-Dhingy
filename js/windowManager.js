// windowManager.js

// --- Dragging ---
function makeDraggable(el) {
  let isDragging = false, offsetX, offsetY;
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

  document.addEventListener('mouseup', () => { isDragging = false; });
}

let topZIndex = 1000;
function bringToFront(el) {
  topZIndex++;
  el.style.zIndex = topZIndex;
  return topZIndex;
}

// --- Windows ---
const aboutWindow = document.getElementById('about-window');
const blogWindow = document.getElementById('blog-window');
const trashWindow = document.getElementById('trash-window');

const aboutIcon = document.querySelector('.desktop-icon img[alt="About Us"]').parentElement;
const blogIcon = document.querySelector('.desktop-icon img[alt="Blog"]').parentElement;
const trashIcon = document.getElementById('trash-icon');

[aboutWindow, blogWindow, trashWindow].forEach(win => {
  makeDraggable(win);
  win.querySelector('.close-btn').addEventListener('click', () => {
    playClickSound();
    win.style.display = 'none';
  });
});

function openWindow(win, left = '100px', top = '100px') {
  playClickSound();
  win.style.display = 'flex';
  win.style.left = left;
  win.style.top = top;
  bringToFront(win);
}

aboutIcon.addEventListener('click', () => openWindow(aboutWindow, '100px', '100px'));
blogIcon.addEventListener('click', () => openWindow(blogWindow, '120px', '120px'));
trashIcon.addEventListener('click', () => openWindow(trashWindow, '140px', '140px'));

// --- Data ---
const blogPosts = [
  { title: 'Test Post 1', content: 'This is the content of Test Post 1.', date: '2025-05-28' },
  { title: 'Test Post 2', content: 'This is the content of Test Post 2.', date: '2025-05-27' }
];

const aboutPeople = {
  person1: `<h4>Person 1</h4><p>Details about person 1...</p>`,
  person2: `<h4>Person 2</h4><p>Details about person 2...</p>`
};

const trashFilesData = {
  'example-image.png': { type: 'image' },
  'notes.txt': { type: 'text' }
};

// --- Render Blog List ---
function renderBlogList() {
  const blogList = document.querySelector('.blog-file-list');
  const postContent = document.getElementById('post-content');
  blogList.innerHTML = '';

  blogPosts.forEach(post => {
    const item = document.createElement('div');
    item.style = 'display:flex;justify-content:space-between;align-items:center;padding:4px;cursor:pointer;';
    
    const left = document.createElement('div');
    left.style = 'display:flex;align-items:center;';
    
    const icon = document.createElement('img');
    icon.src = 'assets/icons/79.png';
    icon.alt = 'File Icon';
    icon.style = 'width:32px;height:32px;margin-right:8px;';
    
    const title = document.createElement('span');
    title.className = 'blog-post-title';
    title.textContent = post.title;

    left.appendChild(icon);
    left.appendChild(title);

    const date = document.createElement('span');
    date.style = 'font-size:11px;color:#666;';
    date.textContent = post.date;

    item.appendChild(left);
    item.appendChild(date);
    item.addEventListener('click', () => {
      playClickSound();
      postContent.innerHTML = `<p>${post.content}</p>`;
    });

    blogList.appendChild(item);
  });
}
renderBlogList();

// --- Render About People ---
function renderAboutPeople() {
  const aboutList = document.getElementById('about-file-list');
  const personContent = document.getElementById('person-content');
  if (!aboutList || !personContent) return;

  aboutList.innerHTML = '';
  for (const [key, html] of Object.entries(aboutPeople)) {
    const item = document.createElement('div');
    item.className = 'about-file';
    item.style = 'padding: 4px; cursor: pointer;';
    item.textContent = key;
    item.dataset.person = key;
    item.addEventListener('click', () => {
      playClickSound();
      personContent.innerHTML = html;
    });
    aboutList.appendChild(item);
  }
}
renderAboutPeople();

// --- Render Trash ---
function renderTrashFiles() {
  const trashList = document.getElementById('trash-file-list');
  const trashPreview = document.getElementById('trash-preview');
  if (!trashList || !trashPreview) return;

  trashList.innerHTML = '';
  for (const [filename, fileData] of Object.entries(trashFilesData)) {
    const row = document.createElement('div');
    row.className = 'trash-file';
    row.style = 'display:flex;justify-content:space-between;padding:4px;cursor:pointer;';

    const nameCol = document.createElement('div');
    nameCol.className = 'file-col name';
    nameCol.textContent = filename;

    row.appendChild(nameCol);
    row.addEventListener('click', () => {
      playClickSound();
      if (fileData.type === 'image') {
        trashPreview.innerHTML = `
          <h4>${filename}</h4>
          <img src="assets/trash/${filename}" alt="${filename}" style="max-width:100%; max-height:300px;" />
        `;
      } else if (fileData.type === 'text') {
        fetch(`assets/trash/${filename}`)
          .then(res => res.text())
          .then(text => {
            trashPreview.innerHTML = `
              <h4>${filename}</h4>
              <pre style="white-space:pre-wrap; word-wrap:break-word;">${text}</pre>
            `;
          })
          .catch(() => {
            trashPreview.innerHTML = `<p>Unable to load text file.</p>`;
          });
      } else {
        trashPreview.innerHTML = `<p>Unknown file type.</p>`;
      }
    });

    trashList.appendChild(row);
  }
}
renderTrashFiles();
