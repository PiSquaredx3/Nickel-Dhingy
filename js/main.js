// main.js

// --- Utility to play click sound ---
function playClickSound() {
  const clickSound = new Audio('assets/sounds/Click.wav');
  clickSound.play().catch(() => {});
}

// --- Update time display ---
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

// --- On page load, hide boot screen and play startup sound ---
window.addEventListener('load', () => {
  const progress = document.querySelector('.boot-progress');
  const startupSound = new Audio('assets/sounds/Startup.wav');

  progress.style.width = '0%';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progress.style.width = '100%';
    });
  });

  setTimeout(() => {
    document.getElementById('boot-screen').style.display = 'none';
    document.getElementById('desktop').style.display = 'block';
    startupSound.play().catch(() => {
      console.log('Startup sound playback prevented.');
    });
  }, 10000);
});
