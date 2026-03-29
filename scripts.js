// ===== INICIALIZA ÍCONES LUCIDE =====
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  initNavbar();
  initScrollAnimations();
  initSmoothScroll();
  initGallery();
  initLightbox();
  initBackToTop();
  initMenuMobile();
});

// ===== NAVBAR: scroll + active state =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  const sections = Array.from(document.querySelectorAll('section[id]'));

  const handleScroll = () => {
    // Scroll class
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link detection
    let currentSection = '';
    sections.forEach(sec => {
      const sectionTop = sec.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load
}

// ===== MENU MOBILE =====
function initMenuMobile() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const navLinks = menu.querySelectorAll('.nav-link');
  let isOpen = false;

  // Overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    z-index: 998; opacity: 0; visibility: hidden;
    transition: all 0.3s ease; backdrop-filter: blur(2px);
  `;
  document.body.appendChild(overlay);

  const openMenu = () => {
    isOpen = true;
    menu.classList.add('open');
    overlay.style.opacity = '1';
    overlay.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
    // Animate hamburger → X
    const spans = toggle.querySelectorAll('span');
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  };

  const closeMenu = () => {
    isOpen = false;
    menu.classList.remove('open');
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    document.body.style.overflow = '';
    const spans = toggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  };

  toggle.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // All fade-in elements
  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });

  // Atuação cards (different animation class)
  document.querySelectorAll('.atuacao-card').forEach(el => {
    observer.observe(el);
  });

  // Artigo cards
  document.querySelectorAll('.artigo-card').forEach(el => {
    observer.observe(el);
  });

  // Pesquisa cards (staggered)
  const pesquisaCards = document.querySelectorAll('.pesquisa-card');
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 100);
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  pesquisaCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    staggerObserver.observe(card);
  });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = document.getElementById('navbar').offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== GALERIA =====
let galleryImages = [];
let currentIndex = 0;

function initGallery() {
  const items = document.querySelectorAll('.gallery-item');

  // Collect all images
  items.forEach((item, index) => {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-overlay span');

    if (img) {
      galleryImages.push({
        src: img.src,
        alt: img.alt,
        caption: caption ? caption.textContent : img.alt
      });

      item.addEventListener('click', () => {
        openLightbox(index);
      });

      // Keyboard support
      item.setAttribute('tabindex', '0');
      item.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    }
  });
}

// ===== LIGHTBOX =====
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => navigateLightbox(-1));
  nextBtn.addEventListener('click', () => navigateLightbox(1));

  // Click outside to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch(e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': navigateLightbox(-1); break;
      case 'ArrowRight': navigateLightbox(1); break;
    }
  });

  // Touch/swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      navigateLightbox(diff > 0 ? 1 : -1);
    }
  }, { passive: true });
}

function openLightbox(index) {
  currentIndex = index;
  updateLightboxImage();

  const lightbox = document.getElementById('lightbox');
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Re-init lucide icons in lightbox
  if (window.lucide) lucide.createIcons();
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  currentIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const data = galleryImages[currentIndex];

  if (!data) return;

  // Fade transition
  img.style.opacity = '0';
  img.style.transform = 'scale(0.96)';

  setTimeout(() => {
    img.src = data.src;
    img.alt = data.alt;
    caption.textContent = data.caption;

    img.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    img.style.opacity = '1';
    img.style.transform = 'scale(1)';
  }, 150);
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const btn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== CONTADOR DE ESTATÍSTICAS (animação) =====
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent.trim();

        const match = text.match(/^(\d+)/);
        if (match) {
          const target = parseInt(match[1]);
          const suffix = text.replace(match[1], '');
          let current = 0;
          const duration = 1300;
          const step = target / (duration / 16);

          const update = () => {
            current = Math.min(current + step, target);
            el.textContent = Math.floor(current) + suffix;
            if (current < target) requestAnimationFrame(update);
          };

          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// Run counter animation
animateCounters();

// ===== PARALLAX suave no hero =====
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const scrolled = window.scrollY;
  const heroShapes = hero.querySelectorAll('.shape');
  heroShapes.forEach((shape, i) => {
    const speed = 0.15 + (i * 0.08);
    shape.style.transform = `translateY(${scrolled * speed}px)`;
  });
}, { passive: true });

// ===== ACTIVE LINK STYLE =====
const style = document.createElement('style');
style.textContent = `
  .nav-link.active {
    color: var(--color-primary) !important;
  }
  .nav-link.active::after {
    width: 100% !important;
    background: var(--color-primary) !important;
  }
`;
document.head.appendChild(style);

// ===== LOG INIT =====
console.log('%c🌿 Pedro Yuri — Landing Page', 'color: #7C6A8E; font-size: 16px; font-weight: bold;');
console.log('%cCriado com amor, afeto e código.', 'color: #B5C4A1; font-size: 12px;');
