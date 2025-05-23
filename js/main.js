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
    if (!header) return; // just in case
  
    header.style.cursor = 'move';
  
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      el.style.position = 'absolute';
      el.style.zIndex = 1000;
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
  
  // --- Update time function remains unchanged ---
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
  
  // --- Helper: Close all windows ---
  function closeAllWindows() {
    allWindows.forEach(win => {
      win.style.display = 'none';
    });
  }
  
  // --- Open window helper ---
  function openWindow(win, left = '100px', top = '100px') {
    playClickSound();
    closeAllWindows();
    win.style.display = 'flex';
    win.style.left = left;
    win.style.top = top;
  }
  
  // --- Icon click handlers ---
  aboutIcon.addEventListener('click', () => openWindow(aboutWindow, '100px', '100px'));
  blogIcon.addEventListener('click', () => openWindow(blogWindow, '120px', '120px'));
  trashIcon.addEventListener('click', () => openWindow(trashWindow, '140px', '140px'));
  
  // --- Make all windows draggable ---
  allWindows.forEach(win => makeDraggable(win));
  
  // --- Blog post selection (unchanged) ---
  const blogFiles = document.querySelectorAll('.blog-file');
  const postContentDiv = document.getElementById('post-content');
  
  const blogPosts = {
    post1: `<h4>Welcome!</h4><p>We're currently under construction right now so uh come back later</p>`,
  };
  
  blogFiles.forEach(file => {
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
  
  // --- About person selection (unchanged) ---
  const aboutFiles = document.querySelectorAll('.about-file');
  const personContentDiv = document.getElementById('person-content');
  
  const aboutPeople = {
    person1: `<h4>Person 1</h4><p>Details about person 1...</p>`,
    person2: `<h4>Person 2</h4><p>Details about person 2...</p>`
  };
  
  aboutFiles.forEach(file => {
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
  
  // --- Boot screen loading bar and startup sound unchanged ---
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



  const trashFiles = document.querySelectorAll('#trash-window .trash-file');
  const trashPreview = document.getElementById('trash-preview');
  
  trashFiles.forEach(file => {
    file.addEventListener('click', () => {
      const fileType = file.dataset.type; // Get the file type (image or text)
      const fileName = file.querySelector('.file-col.name').textContent.trim(); // Get the file name
  
      if (fileType === 'image') {
        // Show image preview
        trashPreview.innerHTML = `
          <h4>${fileName}</h4>
          <img src="assets/trash/${fileName}" alt="${fileName}" style="max-width:100%; max-height:300px;" />
        `;
      } else if (fileType === 'text') {
        // Show text preview
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
      } else {
        trashPreview.innerHTML = `<p>Unknown file type.</p>`;
      }
    });
  });
