/* =============================================
   DOYCEPHEMZY GRAPHIXS — Portfolio Scripts
   script.js
   ============================================= */

/* ---------- SMOOTH NAV HIGHLIGHT ---------- */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach((section) => observer.observe(section));

/* ---------- SCROLL REVEAL ---------- */
const revealElements = document.querySelectorAll(
  '.project-card, .skill-card, .stat-item, .value-item'
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});

/* ---------- NAV SCROLL SHADOW ---------- */
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.style.boxShadow = '0 2px 24px rgba(43,43,43,0.08)';
  } else {
    nav.style.boxShadow = 'none';
  }
});

/* ---------- ACTIVE NAV STYLE ---------- */
const style = document.createElement('style');
style.textContent = `
  .nav-links a.active {
    color: var(--brown) !important;
  }
`;
document.head.appendChild(style);

/* =============================================
   LIGHTBOX
   ============================================= */

const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxTag   = document.getElementById('lightbox-tag');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxOverlay = document.getElementById('lightbox-overlay');

const projectData = [
  {
    selector: '.project-card:nth-child(1)',
    img: 'flpp.jpg',
    title: 'Sundry Snacks & Classes',
    tag: 'Graphic Design · Flyer'
  },
  {
    selector: '.project-card:nth-child(2)',
    img: 'invitation_card.jpg',
    title: 'Aqiqah Ceremony Invitation',
    tag: 'Graphic Design · Print'
  },
  {
    selector: '.project-card:nth-child(3)',
    img: 'weather.jpg',
    title: 'Live Weather App',
    tag: 'Web Development'
  }
];

let hoverTimer = null;

function openLightbox(img, title, tag) {
  lightboxImg.src = img;
  lightboxTitle.textContent = title;
  lightboxTag.textContent = tag;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  clearTimeout(hoverTimer);
}

projectData.forEach(({ selector, img, title, tag }) => {
  const card = document.querySelector(selector);
  if (!card) return;

  // Open on click
  card.addEventListener('click', () => openLightbox(img, title, tag));

  // Open on hover after short delay
  card.addEventListener('mouseenter', () => {
    hoverTimer = setTimeout(() => openLightbox(img, title, tag), 600);
  });

  card.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
  });
});

// Close when clicking the glassmorphism background (outside the image)
lightbox.addEventListener('click', (e) => {
  if (!e.target.closest('.lightbox-img-wrap') && !e.target.closest('.lightbox-title')) {
    closeLightbox();
  }
});

// Close on button or Escape key
lightboxClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});