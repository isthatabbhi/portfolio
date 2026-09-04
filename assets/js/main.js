
// 1. Lenis Smooth Inertia Scroll Engine
let lenis;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#top') {
        e.preventDefault();
        lenis.scrollTo(0, { duration: 1.4 });
      } else {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -70, duration: 1.4 });
        }
      }
    });
  });
}

// 2. Micro Scroll Progress Bar & Back to Top Button
const progressBar = document.getElementById('scroll-progress');
const backToTopBtn = document.getElementById('back-to-top');
const footerElement = document.querySelector('.site-footer');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;

  if (progressBar) {
    progressBar.style.transform = `scaleX(${progress})`;
  }

  if (backToTopBtn) {
    if (scrollTop > 450) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }
}, { passive: true });

// Fade out floating Back to Top button when footer enters viewport
if (backToTopBtn && footerElement) {
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        backToTopBtn.classList.add('footer-hidden');
      } else {
        backToTopBtn.classList.remove('footer-hidden');
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 0px 0px'
  });

  footerObserver.observe(footerElement);
}

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// 3. One-Click Copy Email with Floating Toast Pill
function copyEmailToClipboard(email) {
  navigator.clipboard.writeText(email).then(() => {
    showToast(`Copied ${email} to clipboard`);
  }).catch(() => {
    showToast(email);
  });
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = `<i class="fas fa-check" style="color: #ff5c35;"></i> ${msg}`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

document.querySelectorAll('.copy-email-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const email = btn.getAttribute('data-email') || 'corp.abhishekk@gmail.com';
    copyEmailToClipboard(email);
  });
});

// 4. FinGuard Deep-Dive Drawer
const drawerOverlay = document.getElementById('project-drawer-overlay');
const drawerCloseBtn = document.getElementById('drawer-close-btn');
const drawerElement = document.querySelector('.project-drawer');
const finguardCard = document.querySelector('[data-testid="project-finguard-card"]');

function openDrawer() {
  if (drawerOverlay) {
    drawerOverlay.classList.add('open');
    document.body.classList.add('modal-open');
    if (lenis) lenis.stop();
  }
}

function closeDrawer() {
  if (drawerOverlay) {
    drawerOverlay.classList.remove('open');
    if (!resumeModalOverlay || !resumeModalOverlay.classList.contains('open')) {
      document.body.classList.remove('modal-open');
      if (lenis) lenis.start();
    }
  }
}

if (finguardCard) {
  finguardCard.addEventListener('click', openDrawer);
}

if (drawerCloseBtn) {
  drawerCloseBtn.addEventListener('click', closeDrawer);
}

if (drawerOverlay) {
  drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) closeDrawer();
  });
  drawerOverlay.addEventListener('wheel', (e) => {
    e.stopPropagation();
  }, { passive: true });
}

// 5. Interactive Resume Preview Modal
const resumeModalOverlay = document.getElementById('resume-modal-overlay');
const resumeCloseBtn = document.getElementById('resume-close-btn');
const openResumeBtns = document.querySelectorAll('.open-resume-modal-btn');

function openResumeModal() {
  if (resumeModalOverlay) {
    resumeModalOverlay.classList.add('open');
    document.body.classList.add('modal-open');
    if (lenis) lenis.stop();
  }
}

function closeResumeModal() {
  if (resumeModalOverlay) {
    resumeModalOverlay.classList.remove('open');
    if (!drawerOverlay || !drawerOverlay.classList.contains('open')) {
      document.body.classList.remove('modal-open');
      if (lenis) lenis.start();
    }
  }
}

openResumeBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openResumeModal();
  });
});

if (resumeCloseBtn) {
  resumeCloseBtn.addEventListener('click', closeResumeModal);
}

if (resumeModalOverlay) {
  resumeModalOverlay.addEventListener('click', (e) => {
    if (e.target === resumeModalOverlay) closeResumeModal();
  });
  resumeModalOverlay.addEventListener('wheel', (e) => {
    e.stopPropagation();
  }, { passive: true });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawer();
    closeResumeModal();
  }
});

// 6. Scroll-Triggered Masked Line Reveals
(function initScrollReveals() {
  const revealContainers = document.querySelectorAll('.section-frame, .hero-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealContainers.forEach(container => observer.observe(container));
})();

// 7. Active Section Spy & Scrolled Navbar
const nav = document.querySelector('.site-nav');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.desktop-nav a:not(.nav-resume-badge)');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 140;
    if (window.pageYOffset >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}, { passive: true });

// 8. Mobile Menu Toggle
const mobileBtn = document.querySelector('.mobile-menu-button');
const mobileNav = document.querySelector('.mobile-nav');

if (mobileBtn && mobileNav) {
  mobileBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    const icon = mobileBtn.querySelector('i');
    if (icon) {
      if (mobileNav.classList.contains('open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  });

  mobileNav.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      const icon = mobileBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  });
}
