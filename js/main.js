/* ============================================================
   Prime Talent Hub — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Utility helpers
  ---------------------------------------------------------- */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ----------------------------------------------------------
     1. Navbar — sticky + scroll class + active link
  ---------------------------------------------------------- */
  const navbar    = qs('#navbar');
  const hamburger = qs('#hamburger');
  const navLinks  = qs('#navLinks');
  const sections  = qsa('section[id]');
  const navAnchors = qsa('.nav-link');

  // Scroll handler
  window.addEventListener('scroll', () => {
    // Sticky background
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link based on scroll position
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });
    navAnchors.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) {
        a.classList.add('active');
      }
    });

    // Scroll-to-top button
    scrollTopBtn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu on link click
  navLinks.addEventListener('click', e => {
    if (e.target.classList.contains('nav-link')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Smooth scroll for all anchor links
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = qs(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 8;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });

  /* ----------------------------------------------------------
     2. Scroll-to-top button
  ---------------------------------------------------------- */
  const scrollTopBtn = qs('#scrollTopBtn');
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------
     3. Intersection Observer — Reveal animations
  ---------------------------------------------------------- */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  qsa('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });

  /* ----------------------------------------------------------
     4. Counter animation for hero stats
  ---------------------------------------------------------- */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          qsa('.stat-num', entry.target).forEach(animateCounter);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const heroStats = qs('.hero-stats');
  if (heroStats) counterObserver.observe(heroStats);

  /* ----------------------------------------------------------
     5. Metric bars — initialise (animated in section 8)
  ---------------------------------------------------------- */
  const metricsCard = qs('.metrics-card');

  /* ----------------------------------------------------------
     6. Testimonials slider
  ---------------------------------------------------------- */
  const track  = qs('#testiTrack');
  const prevBtn = qs('#testiPrev');
  const nextBtn = qs('#testiNext');
  const dotsContainer = qs('#testiDots');

  if (track) {
    const cards      = qsa('.testi-card', track);
    let current      = 0;
    let autoInterval = null;

    function getCardsPerView() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const total = Math.ceil(cards.length / getCardsPerView());
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className   = 'testi-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(index) {
      const perView  = getCardsPerView();
      const maxIndex = Math.ceil(cards.length / perView) - 1;
      current        = Math.max(0, Math.min(index, maxIndex));

      const cardWidth  = cards[0].offsetWidth + 14; // gap = 7+7
      const offset     = current * perView * cardWidth;
      track.style.transform = `translateX(-${offset}px)`;

      qsa('.testi-dot', dotsContainer).forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      clearInterval(autoInterval);
      autoInterval = setInterval(next, 4500);
    }

    buildDots();
    startAuto();

    prevBtn.addEventListener('click', () => { prev(); startAuto(); });
    nextBtn.addEventListener('click', () => { next(); startAuto(); });

    // Touch / swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); startAuto(); }
    });

    // Rebuild on resize
    window.addEventListener('resize', () => { buildDots(); goTo(0); }, { passive: true });
  }

  /* ----------------------------------------------------------
     7. Contact form
  ---------------------------------------------------------- */
  const contactForm = qs('#contactForm');
  const formSuccess = qs('#formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      // Basic client-side validation
      const name    = contactForm.elements['name'].value.trim();
      const email   = contactForm.elements['email'].value.trim();
      const company = contactForm.elements['company'].value.trim();
      const service = contactForm.elements['service'].value;
      const message = contactForm.elements['message'].value.trim();

      let hasError = false;
      if (!name)    { highlightField(contactForm.elements['name']);    hasError = true; }
      if (!company) { highlightField(contactForm.elements['company']); hasError = true; }
      if (!service) { highlightField(contactForm.elements['service']); hasError = true; }
      if (!message) { highlightField(contactForm.elements['message']); hasError = true; }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        highlightField(contactForm.elements['email']);
        hasError = true;
      }

      if (hasError) {
        shakeForm(contactForm);
        return;
      }

      // hCaptcha validation — Web3Forms proxy populates a textarea[name=h-captcha-response]
      const captchaTextarea = contactForm.querySelector('textarea[name=h-captcha-response]');
      const captchaResponse = captchaTextarea ? captchaTextarea.value : '';
      if (!captchaResponse) {
        showFormError('Please complete the captcha before submitting.');
        return;
      }

      // -----------------------------------------------------------
      // Web3Forms integration — free email notifications for static sites
      // Step 1: Go to https://web3forms.com and enter primetalenthub.info@gmail.com
      // Step 2: Check your inbox and click the activation link
      // Step 3: Copy the access key you receive and paste it below
      // -----------------------------------------------------------
      const WEB3FORMS_ACCESS_KEY = '5f7b13f7-4d68-44e2-8ea0-2f2419325482';

      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Sending…';

      const payload = new FormData();
      payload.append('access_key', WEB3FORMS_ACCESS_KEY);
      payload.append('subject',    `New Enquiry from ${name} – Prime Talent Hub`);
      payload.append('name',    name);
      payload.append('email',   email);
      payload.append('phone',   contactForm.elements['phone'].value.trim());
      payload.append('company', company);
      payload.append('service', service);
      payload.append('message', message);
      payload.append('from_name', 'Prime Talent Hub Website');
      payload.append('h-captcha-response', captchaResponse);

      fetch('https://api.web3forms.com/submit', { method: 'POST', body: payload })
        .then(res => res.json())
        .then(data => {
          btn.disabled = false;
          btn.querySelector('span').textContent = 'Send Enquiry';
          if (window.hcaptcha) hcaptcha.reset();
          if (data.success) {
            contactForm.reset();
            formSuccess.classList.add('visible');
            setTimeout(() => formSuccess.classList.remove('visible'), 6000);
          } else {
            showFormError('Something went wrong. Please email us directly.');
          }
        })
        .catch(() => {
          btn.disabled = false;
          btn.querySelector('span').textContent = 'Send Enquiry';
          if (window.hcaptcha) hcaptcha.reset();
          showFormError('Network error. Please try again or email us directly.');
        });
    });
  }

  function showFormError(msg) {
    const original = formSuccess.textContent;
    formSuccess.textContent = '✗ ' + msg;
    formSuccess.style.color = '#F87171';
    formSuccess.classList.add('visible');
    setTimeout(() => {
      formSuccess.classList.remove('visible');
      formSuccess.textContent = original;
      formSuccess.style.color = '';
    }, 6000);
  }

  function shakeForm(form) {
    form.style.animation = 'shake 0.4s ease';
    form.addEventListener('animationend', () => { form.style.animation = ''; }, { once: true });
  }
  function highlightField(field) {
    field.style.borderColor = '#F87171';
    field.focus();
    field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
  }

  /* Shake keyframes — injected dynamically */
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  /* ----------------------------------------------------------
     8. Metric bars — animate widths when scrolled into view
  ---------------------------------------------------------- */
  if (metricsCard) {
    const fills = qsa('.metric-fill', metricsCard);
    const targets = ['98%', '95%', '97%', '92%'];

    // Reset to 0 width initially so the CSS transition plays
    fills.forEach(f => { f.style.width = '0%'; });

    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fills.forEach((f, i) => {
            setTimeout(() => { f.style.width = targets[i] || '80%'; }, i * 120);
          });
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    barObserver.observe(metricsCard);
  }

  /* ----------------------------------------------------------
     9. Hero load animation
  ---------------------------------------------------------- */
  const heroInner = qs('.hero-inner');
  if (heroInner) {
    heroInner.style.opacity  = '0';
    heroInner.style.transform = 'translateY(30px)';
    heroInner.style.transition = 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroInner.style.opacity   = '1';
        heroInner.style.transform = 'translateY(0)';
      });
    });
  }

})();
