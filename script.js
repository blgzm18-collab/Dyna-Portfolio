// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      if (this.getAttribute('href') !== '#') {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Simple theme toggle (dark <-> darker red accent)
  const toggle = document.querySelector('.theme-toggle');
  let isRedAccent = false;

  toggle.addEventListener('click', () => {
    isRedAccent = !isRedAccent;
    document.documentElement.style.setProperty('--accent', isRedAccent ? '#c0392b' : '#8B0000');
    document.documentElement.style.setProperty('--highlight', isRedAccent ? '#ff5555' : '#ff3333');
    
    const icon = toggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
  });
});
