/* ==================== GELTEK HAIR — лендинг ==================== */
(function () {
  'use strict';

  /* ---------- Ссылки на карточки товара в магазинах ---------- */
  /* Ведут на поиск бренда внутри каждого магазина — открывают актуальные
     карточки Geltek Hair даже при смене прямых URL товаров. */
  var SHOP_URLS = {
    apteka:    'https://apteka.ru/search/?q=geltek%20hair',                  // TODO: заменить на полную карточку (ссылка обрезалась при вставке)
    goldapple: 'https://goldapple.ru/19000449273-with-peptides',             // карточка сыворотки
    wb:        'https://www.wildberries.ru/catalog/489447740/detail.aspx',   // карточка сыворотки
    ozon:      'https://ozon.ru/t/5DObdNM'                                    // карточка сыворотки
  };
  var RESEARCH_URL = 'assets/docs/issledovanie-syvorotka-peptidy.pdf'; // PDF исследования — положить файл в assets/docs/

  document.querySelectorAll('[data-shop]').forEach(function (a) {
    var url = SHOP_URLS[a.getAttribute('data-shop')];
    if (url) a.setAttribute('href', url);
  });
  document.querySelectorAll('[data-research]').forEach(function (a) {
    if (RESEARCH_URL) { a.setAttribute('href', RESEARCH_URL); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    else a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ---------- Появление блоков (reveal) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Хедер: тень + активный пункт меню ---------- */
  var header = document.getElementById('header');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);

  /* ---------- Бургер-меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function closeMenu() { nav.classList.remove('is-open'); burger.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  navLinks.forEach(function (l) { l.addEventListener('click', closeMenu); });

  /* ---------- Флакон, едущий по скроллу ---------- */
  var bottle = document.getElementById('bottle');
  var bottleTrack = document.getElementById('bottleTrack');
  var advantages = document.getElementById('advantages');

  /* ---------- Параллакс: логотип на производстве + волосы ---------- */
  var parallaxLogo = document.querySelector('[data-parallax-logo]');
  var parallaxHair = document.querySelector('[data-parallax-hair]');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;

    // тень хедера
    if (header) header.classList.toggle('is-scrolled', y > 20);

    // активный пункт меню
    var cur = null, mid = y + window.innerHeight * 0.35;
    sections.forEach(function (s) { if (s.offsetTop <= mid) cur = s.id; });
    navLinks.forEach(function (l) {
      l.classList.toggle('is-active', l.getAttribute('href') === '#' + cur);
    });

    if (reduceMotion) { ticking = false; return; }

    // флакон: спускается вниз по мере прокрутки hero + преимуществ, затем растворяется
    if (bottle && advantages) {
      var pinEnd = advantages.offsetTop + advantages.offsetHeight - 140;
      var progress = Math.max(0, Math.min(1, y / pinEnd));
      var startTop = 180, endTop = window.innerHeight * 0.52;
      bottle.style.top = (startTop + (endTop - startTop) * progress).toFixed(1) + 'px';
      var op = progress > 0.85 ? Math.max(0, (1 - progress) / 0.15) : 1;
      // прячем на узких экранах
      bottle.style.opacity = (window.innerWidth <= 720 ? 0 : op).toFixed(2);
    }

    // параллакс логотипа GELTEK на фото производства
    if (parallaxLogo) {
      var r = parallaxLogo.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        var p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
        parallaxLogo.style.transform = 'translateY(' + ((p - 0.5) * 80).toFixed(1) + 'px)';
      }
    }

    // параллакс фона волос
    if (parallaxHair) {
      var hr = parallaxHair.parentElement.getBoundingClientRect();
      if (hr.bottom > 0 && hr.top < window.innerHeight) {
        var ph = (window.innerHeight - hr.top) / (window.innerHeight + hr.height);
        parallaxHair.style.transform = 'translateY(' + ((ph - 0.5) * -60).toFixed(1) + 'px)';
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
