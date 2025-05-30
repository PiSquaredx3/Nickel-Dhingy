// --- Utility to play click sound with new Audio instance to avoid blocking ---
function playClickSound() {
  const clickSound = new Audio('assets/sounds/Click.wav');
  clickSound.play().catch(() => {});
}

// --- Make windows draggable ---
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

// --- Helper to bring window to front by increasing z-index ---
let topZIndex = 1000;
function bringToFront(el) {
  topZIndex++;
  el.style.zIndex = topZIndex;
  return topZIndex;
}

// --- Update time function ---
function updateTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const isPM = hours >= 12;
  hours = hours % 12 || 12;
  const timeString = `${hours}:${minutes} ${isPM ? 'PM' : 'AM'}`;
  document.getElementById('time').textContent = timeString;
}
updateTime();
setInterval(updateTime, 1000);

// --- Grab all windows and icons ---
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
  // allow multiple windows open (no closeAllWindows here)
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

// --- Data Objects for Blog, About, Trash ---

const blogPosts = {
  post1: {
    title: "Test Post 1",
    date: "2025-05-28",
    content: `<h4>Welcome!</h4><p>We're currently under construction so come back later.</p>`
  },
  post2: {
    title: "Test Post 2",
    date: "2025-05-27",
    content: `<h4>Another post</h4><p>More sample content here.</p>`
  }
};

const aboutPeople = {
  person1: {
    name: "Person 1",
    date: "2025-05-25",
    content: `<h4>Person 1</h4><p>Details about person 1...</p>`
  },
  person2: {
    name: "Person 2",
    date: "2025-05-24",
    content: `<h4>Person 2</h4><p>Details about person 2...</p>`
  }
};

const trashFilesData = [
  {
    name: "image1.png",
    date: "2025-05-20",
    type: "image"
  },
  {
    name: "notes.txt",
    date: "2025-05-19",
    type: "text"
  }
];

// --- Utility to create file list items ---
function createFileItem({iconSrc, title, date, onClick}) {
  const item = document.createElement('div');
  item.style.display = 'flex';
  item.style.justifyContent = 'space-between';
  item.style.alignItems = 'center';
  item.style.padding = '4px';
  item.style.cursor = 'pointer';

  item.innerHTML = `
    <div style="display:flex; align-items:center;">
      <img src="${iconSrc}" alt="File Icon" style="width:16px; height:16px; margin-right:8px;">
      <span>${title}</span>
    </div>
    <span style="font-size:11px; color:#666;">${date}</span>
  `;

  item.addEventListener('click', onClick);
  return item;
}

// --- Generate Blog Files ---
const blogFileList = document.querySelector('.blog-file-list');
const postContentDiv = document.getElementById('post-content');

blogFileList.innerHTML = '';
for (const key in blogPosts) {
  const post = blogPosts[key];
  const item = createFileItem({
    iconSrc: 'assets/icons/file-icon.png',
    title: post.title,
    date: post.date,
    onClick: () => {
      postContentDiv.innerHTML = post.content;
    }
  });
  blogFileList.appendChild(item);
}

// --- Generate About Files ---
const aboutFileList = document.querySelector('.about-file-list');
const personContentDiv = document.getElementById('person-content');

aboutFileList.innerHTML = '';
for (const key in aboutPeople) {
  const person = aboutPeople[key];
  const item = createFileItem({
    iconSrc: 'assets/icons/person-icon.png', // You can provide a person icon
    title: person.name,
    date: person.date,
    onClick: () => {
      personContentDiv.innerHTML = person.content;
    }
  });
  aboutFileList.appendChild(item);
}

// --- Generate Trash Files ---
const trashFileList = document.querySelector('.trash-file-list');
const trashPreview = document.getElementById('trash-preview');

trashFileList.innerHTML = '';
trashFilesData.forEach(file => {
  const icon = file.type === 'image' ? 'assets/icons/image-icon.png' : 'assets/icons/text-icon.png';
  const item = createFileItem({
    iconSrc: icon,
    title: file.name,
    date: file.date,
    onClick: () => {
      if (file.type === 'image') {
        trashPreview.innerHTML = `
          <h4>${file.name}</h4>
          <img src="assets/trash/${file.name}" alt="${file.name}" style="max-width:100%; max-height:300px;" />
        `;
      } else if (file.type === 'text') {
        fetch(`assets/trash/${file.name}`)
          .then(response => response.text())
          .then(text => {
            trashPreview.innerHTML = `
              <h4>${file.name}</h4>
              <pre style="white-space:pre-wrap; word-wrap:break-word;">${text}</pre>
            `;
          })
          .catch(() => {
            trashPreview.innerHTML = `<p>Unable to load the text file.</p>`;
          });
      } else {
        trashPreview.innerHTML = `<p>Unknown file type.</p>`;
      }
    }
  });
  trashFileList.appendChild(item);
});

