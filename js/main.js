(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Ano automático */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* Header ao rolar */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Menu mobile */
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Rolagem suave (fallback p/ navegadores sem scroll-behavior) */
  if (!('scrollBehavior' in document.documentElement.style) && !reduce) {
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); scrollTo({ top: t.offsetTop - 80, behavior: 'smooth' }); }
    }));
  }

  /* Link ativo */
  const links = document.querySelectorAll('.nav__menu a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

  /* Fade-up */
  const fades = document.querySelectorAll('.fade');
  if (reduce || !('IntersectionObserver' in window)) {
    fades.forEach(f => f.classList.add('visible'));
  } else {
    const io = new IntersectionObserver((entries, obs) => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
    }), { threshold: 0.15 });
    fades.forEach(f => io.observe(f));
  }

  /* Carrossel */
  const carousel = document.getElementById('carousel');
  const track = document.getElementById('track');
  const slides = [...track.children];
  const dotsBox = document.getElementById('dots');
  let index = 0, timer;

  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Depoimento ${i + 1}`);
    b.addEventListener('click', () => { go(i); restart(); });
    dotsBox.appendChild(b);
    return b;
  });

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((s, n) => { s.setAttribute('aria-hidden', n !== index); });
    dots.forEach((d, n) => d.setAttribute('aria-selected', n === index));
  }
  const start = () => { if (!reduce) timer = setInterval(() => go(index + 1), 6000); }; /* EDITAR: tempo do autoplay (ms) */
  const stop = () => clearInterval(timer);
  const restart = () => { stop(); start(); };

  document.getElementById('prev').addEventListener('click', () => { go(index - 1); restart(); });
  document.getElementById('next').addEventListener('click', () => { go(index + 1); restart(); });
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { go(index - 1); restart(); }
    if (e.key === 'ArrowRight') { go(index + 1); restart(); }
  });

  go(0); start();
})();
