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

// --- Make all windows draggable ---
document.querySelectorAll('.window').forEach(win => makeDraggable(win));

// --- Icon to window mapping ---
const iconWindowMap = {
  'About Us': 'about-window',
  'Blog': 'blog-window',
  'Trashcan': 'trash-window'
};

// --- Icon click handlers ---
document.querySelectorAll('.desktop-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    const label = icon.querySelector('span').textContent.trim();
    const windowId = iconWindowMap[label];
    const win = document.getElementById(windowId);
    if (win) {
      win.style.display = 'block';
      bringToFront(win);
    }
  });
});

// --- Close button functionality ---
document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const win = btn.closest('.window');
    if (win) {
      win.style.display = 'none';
    }
  });
});
