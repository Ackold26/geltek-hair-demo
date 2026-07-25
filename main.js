/* ==================== GELTEK HAIR — пиксель-перенос: анимации ==================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Появление блоков при скролле (reveal) ---------- */
  var revealSelectors = [
    '.s1 .adv-card', '.s2 .card', '.s3 .card', '.s4 .card', '.s5 .card',
    '.s6 .plate', '.s6 .shopbtn', '.s7 .s7card', '.s8 .s8-btn', '.s8 .s8-photo',
    '.s9 .r-banner', '.s9 .v-banner', '.s10 .s10-title',
    '.m-adv-card', '.m-card-screen .m-card', '.m-s5-card', '.m-s7-card',
    '.m-shopbtn', '.m-s8-btn', '.m-r-banner', '.m-v-banner'
  ];
  var revealEls = document.querySelectorAll(revealSelectors.join(','));

  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealEls.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: '15% 0px 15% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });

    /* страховка: контент не должен оставаться невидимым при нештатной прокрутке */
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
      io.disconnect();
    }, 2500);
  }

  /* ---------- Хедер: подсветка активного пункта при наведении уже в CSS ---------- */
  /* ---------- Бургер мобильного хедера (пока просто индикатор, без выпадающего меню) ---------- */
  var burger = document.querySelector('.m-burger');
  if (burger) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('is-open');
    });
  }

  /* ---------- Флакон, едущий по скроллу внутри hero (desktop .bottle + mobile .m-bottle) ---------- */
  var bottles = document.querySelectorAll('.bottle[data-scroll-y0], .m-bottle[data-scroll-y0]');
  if (bottles.length && !reduceMotion) {
    var ticking = false;

    function updateBottles() {
      bottles.forEach(function (b) {
        var section = b.closest('section');
        if (!section) return;
        var stage = b.closest('.stage,.stage--mobile');
        var rect = section.getBoundingClientRect();
        var vh = window.innerHeight;
        // прогресс прохождения секции: 0 — верх секции у нижнего края экрана, 1 — низ секции у верхнего края
        var total = rect.height + vh;
        var progress = (vh - rect.top) / total;
        progress = Math.max(0, Math.min(1, progress));

        var y0 = parseFloat(b.getAttribute('data-scroll-y0'));
        var y1 = parseFloat(b.getAttribute('data-scroll-y1'));
        var cqw = y0 + (y1 - y0) * progress;
        var w = stage ? stage.getBoundingClientRect().width : window.innerWidth;
        b.style.top = (w * cqw / 100).toFixed(1) + 'px';

        // необязательная непрозрачность конечного состояния (147:30 «Pack 100ml» opacity 0.3)
        var op0attr = b.getAttribute('data-scroll-op0');
        if (op0attr !== null) {
          var op0 = parseFloat(op0attr);
          var op1 = parseFloat(b.getAttribute('data-scroll-op1'));
          b.style.opacity = (op0 + (op1 - op0) * progress).toFixed(3);
        }
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(updateBottles); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', updateBottles);
    updateBottles();
  }
})();
