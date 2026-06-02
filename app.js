// J.R. Ethiraaj Portfolio — Interactivity & Filmography
// Mobile-first, fully fixed version

document.addEventListener('DOMContentLoaded', () => {
  // FIX: Lucide is loaded with defer. Wait for it to be available before calling createIcons.
  waitForLucide(() => {
    lucide.createIcons();
    // Now initialize everything that depends on Lucide icons
    initHeaderScroll();
    initNavigationObserver();
    initMobileMenu();
    initScrollReveal();
    initFilmography();
  });
});

/**
 * FIX: Lucide is loaded via <script defer>. On slow mobile networks it may not
 * be ready by DOMContentLoaded. Poll until it is, then proceed.
 * Falls back gracefully if Lucide never loads (icons simply won't render).
 */
function waitForLucide(callback) {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    callback();
    return;
  }
  let attempts = 0;
  const maxAttempts = 40; // 4 seconds max wait
  const interval = setInterval(() => {
    attempts++;
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      clearInterval(interval);
      callback();
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
      // Lucide failed to load — still run everything else so content is visible
      console.warn('Lucide icons could not be loaded. Falling back without icons.');
      initHeaderScroll();
      initNavigationObserver();
      initMobileMenu();
      initScrollReveal();
      initFilmography();
    }
  }, 100);
}

/* ==========================================================================
   SAFE LUCIDE ICON REFRESH
   ========================================================================== */
function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try {
      lucide.createIcons();
    } catch (e) {
      // Silently ignore — icons are decorative
    }
  }
}

/* ==========================================================================
   HEADER SCROLL
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  // FIX: use passive event listener for scroll — improves scroll performance on mobile
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ==========================================================================
   MOBILE MENU
   ========================================================================== */
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDropdown = document.getElementById('mobile-dropdown');
  if (!mobileMenuBtn || !mobileDropdown) return;

  const iconEl = mobileMenuBtn.querySelector('i');
  const header = document.querySelector('.main-header');

  function setIcon(name) {
    if (iconEl) {
      iconEl.setAttribute('data-lucide', name);
      refreshIcons();
    }
  }

  function openMenu() {
    mobileDropdown.classList.add('open');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    // FIX: update header height reference in case it changed
    if (header) {
      const h = header.offsetHeight;
      mobileDropdown.style.top = h + 'px';
    }
    setIcon('x');
  }

  function closeMenu() {
    mobileDropdown.classList.remove('open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    setIcon('menu');
  }

  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileDropdown.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when any mobile nav link is tapped
  const mobileLinks = mobileDropdown.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // FIX: Close menu on outside tap (important on mobile)
  document.addEventListener('click', (e) => {
    if (mobileDropdown.classList.contains('open') &&
        !mobileDropdown.contains(e.target) &&
        !mobileMenuBtn.contains(e.target)) {
      closeMenu();
    }
  });

  // FIX: Close menu when orientation changes
  window.addEventListener('orientationchange', () => {
    closeMenu();
  });
}

/* ==========================================================================
   ACTIVE SECTION NAVIGATION OBSERVER
   ========================================================================== */
function initNavigationObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  // FIX: lower threshold so it works on mobile where sections are very tall
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    root: null,
    threshold: 0.1,           // FIX: lowered from 0.3 so tall sections register on small screens
    rootMargin: '-60px 0px 0px 0px'
  });

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   SCROLL REVEAL
   FIX: Removed scroll-reveal class from works-section in HTML.
        The works section is now always visible.
        scroll-reveal is kept for other decorative elements only.
        Also: use threshold 0.05 so large sections trigger on mobile.
   ========================================================================== */
function initScrollReveal() {
  // FIX: Immediately make all scroll-reveal elements visible if
  // IntersectionObserver is not supported (old Android WebView)
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const revealElements = document.querySelectorAll('.scroll-reveal');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.05,           // FIX: very low threshold for tall sections on small screens
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   FILMOGRAPHY DATA
   ========================================================================== */
const FEATURED_FILMS = [
  {
    title: 'Ooru Peru Bhiravakona',
    year: '2024',
    role: 'Sound Designer',
    genre: 'Supernatural Fantasy Thriller',
    poster: 'images/ooru_peru_bhiravakona_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=opGD_YmHwdk'
  },
  {
    title: 'Major',
    year: '2022',
    role: 'Sound Designer',
    genre: 'Biographical Action Drama',
    poster: 'images/major_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=LbTN2dOJcbQ'
  },
  {
    title: 'Narappa',
    year: '2021',
    role: 'Sound Designer',
    genre: 'Period Action Drama',
    poster: 'images/narappa_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=GNJ-kT6gFhQ'
  },
  {
    title: 'Evaru',
    year: '2019',
    role: 'Sound Designer & SFX Editor',
    genre: 'Mystery Suspense Thriller',
    poster: 'images/evaru_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=sScDim8DedY'
  },
  {
    title: 'Majili',
    year: '2019',
    role: 'Sound Effects Designer',
    genre: 'Romantic Sports Drama',
    poster: 'images/majili_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=R9VF3m7UiLw'
  },
  {
    title: 'Oh Baby',
    year: '2019',
    role: 'Sound Effects Editor',
    genre: 'Fantasy Comedy Drama',
    poster: 'images/oh_baby_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=kgnJFZZV728'
  },
  {
    title: 'RX100',
    year: '2018',
    role: 'Sound Effects Editor',
    genre: 'Romantic Action Drama',
    poster: 'images/rx100_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=IbPL4FUTvXY'
  },
  {
    title: 'Hello Guru Prema Kosame',
    year: '2018',
    role: 'Sound Effects Editor',
    genre: 'Romantic Comedy',
    poster: 'images/hello_guru_prema_kosame_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=8Q4o87KPInY'
  },
  {
    title: 'Hello!',
    year: '2017',
    role: 'Sound Designer',
    genre: 'Romantic Action Thriller',
    poster: 'images/hello_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=6WgnE6J07e8'
  },
  {
    title: 'Nenu Local',
    year: '2017',
    role: 'Sound Effects Editor',
    genre: 'Action Comedy Romance',
    poster: 'images/nenu_local_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=lylc7eY6yRU'
  },
  {
    title: 'Ninnu Kori',
    year: '2017',
    role: 'Sound Effects Editor',
    genre: 'Romantic Comedy Drama',
    poster: 'images/ninnu_kori_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=Ia6EXfqKiV4'
  },
  {
    title: 'Fidaa',
    year: '2017',
    role: 'Sound Effects Editor & Designer',
    genre: 'Romantic Drama',
    poster: 'images/fidaa_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=AVtvjfoXNXc'
  },
  {
    title: 'Nannaku Prematho',
    year: '2016',
    role: 'Sound Effects Editor',
    genre: 'Action Suspense Thriller',
    poster: 'images/nannaku_prematho_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=Om69gF1iiT4'
  },
  {
    title: 'Oopiri',
    year: '2016',
    role: 'Sound Effects Designer',
    genre: 'Comedy Drama',
    poster: 'images/oopiri_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=e1ddsJ38D5Q'
  },
  {
    title: 'Raju Gari Gadhi',
    year: '2015',
    role: 'Sound Effects Editor',
    genre: 'Horror Comedy',
    poster: 'images/raju_gari_gadhi_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=YBrooCamrbY'
  },
  {
    title: 'Aagadu',
    year: '2014',
    role: 'Sound Designer',
    genre: 'Action Comedy',
    poster: 'images/aagadu_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=qWM09LFpJ8Q'
  },
  {
    title: 'Yevadu',
    year: '2014',
    role: 'Sound Effects Designer',
    genre: 'Action Thriller',
    poster: 'images/yevadu_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=vBIRjqcr5AQ'
  },
  {
    title: 'Adhurs',
    year: '2010',
    role: 'Sound Effects Editor',
    genre: 'Action Comedy',
    poster: 'images/adhurs_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=IVf7tyP_JCs'
  },
  {
    title: 'Don',
    year: '2007',
    role: 'Sound Effects Editor',
    genre: 'Action / Crime Thriller',
    poster: 'images/don_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=JjHs0xin1d0'
  },
  {
    title: 'Athadu',
    year: '2005',
    role: 'Sound Designer & SFX Editor',
    genre: 'Action / Crime Thriller',
    poster: 'images/athadu_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=KWt9dzrc1Go'
  },
  {
    title: 'Mass',
    year: '2004',
    role: 'Sound Effects Editor',
    genre: 'Action / Romance',
    poster: 'images/mass_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=uMs-C3EBYDI'
  },
  {
    title: 'Okkadu',
    year: '2003',
    role: 'Sound Effects Editor',
    genre: 'Romantic Sports Action',
    poster: 'images/okkadu_poster.jpg',
    trailer: 'https://www.youtube.com/watch?v=OlKmTiZ1Nmc'
  }
];

const OTHER_MOVIES = [
  'Honey', 'Mission C1000', 'Rakshana', 'Prabuthwa Junior Kalashala',
  'Maa Kaali', 'Chaurya Paatham', 'Jetty', 'Tuck Jagadish',
  'O Pitta Katha', 'Savaari', 'Dorasaani', "Lakshmi's NTR",
  'Bhairava Geetha', 'Aha Naa Pellanta', 'Fitting Master', 'Anasuya'
];

/* ==========================================================================
   FILMOGRAPHY RENDER
   ========================================================================== */
function initFilmography() {
  const container = document.getElementById('films-container');
  const otherContainer = document.getElementById('other-films-container');

  if (!container) {
    console.warn('films-container not found in DOM');
    return;
  }

  // Render Featured Films
  const fragment = document.createDocumentFragment();

  FEATURED_FILMS.forEach(film => {
    const card = document.createElement('div');
    card.className = 'film-card';

    // FIX: Use textContent for user-controlled data to avoid XSS.
    // Build card with safe DOM operations where possible.
    // For the trailer link we need an <a> — sanitize via encodeURIComponent guard.
    const safeTrailer = film.trailer.startsWith('https://') ? film.trailer : '#';

    card.innerHTML = `
      <div class="film-image-container">
        <img
          src="${escapeAttr(film.poster)}"
          alt="${escapeAttr(film.title)} Poster"
          class="film-poster"
          loading="lazy"
          decoding="async"
          onerror="this.style.opacity='0.3'"
        >
      </div>
      <a
        href="${escapeAttr(safeTrailer)}"
        target="_blank"
        rel="noopener noreferrer"
        class="trailer-link"
        aria-label="Watch ${escapeAttr(film.title)} trailer on YouTube"
      >
        <i data-lucide="play-circle"></i>
        <span>Watch Trailer</span>
      </a>
      <div class="film-details">
        <span class="film-year">${escapeHTML(film.year)}</span>
        <h3 class="film-title">${escapeHTML(film.title)}</h3>
        <p class="film-role">${escapeHTML(film.role)}</p>
        <div class="film-tags">
          <span class="tag">${escapeHTML(film.genre)}</span>
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  // Render Other Movies
  if (otherContainer) {
    const otherFrag = document.createDocumentFragment();
    OTHER_MOVIES.forEach(movie => {
      const tag = document.createElement('div');
      tag.className = 'other-film-item';
      tag.textContent = movie;
      otherFrag.appendChild(tag);
    });
    otherContainer.appendChild(otherFrag);
  }

  // FIX: Re-initialise Lucide icons after injecting dynamic HTML
  refreshIcons();
}

/* ==========================================================================
   UTILITY HELPERS
   ========================================================================== */
function escapeHTML(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
