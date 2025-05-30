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

// --- Make all windows draggable ---
document.querySelectorAll('.window').forEach(win => makeDraggable(win));
