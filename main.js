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

  /* ---------- Единый обработчик прокрутки: два типа эффектов на элементах секций ----------
     - data-scroll-y0/y1 — абсолютная интерполяция top: флакон hero (N1), надпись GELTEK
       в блоке «Доверие» (N2);
     - data-par="<амплитуда в cqw>" — относительное смещение translateY от -амплитуда/2 до
       +амплитуда/2 (декоративный «лёгкий эффект движения» экранов 2/3/4/5/6/7/10, N5). Амплитуда
       в разметке — исходное значение из длины стрелки макета (px/19.2), потолок 3cqw — из карты —
       применяет сам обработчик (Math.min), а не заранее подставленное на глаз число.

     Прогресс прохождения секции через экран считается двумя формулами:
     - первый экран (.s1/.m-s1): флакон не должен быть смещён/полупрозрачным на старте страницы
       (было — прогресс уже 0.36 при scrollY=0), поэтому прогресс считаем от начала страницы:
       0 — секция не прокручена (элемент в исходной позиции), 1 — секция ушла вверх на свою высоту;
     - остальные секции: прежняя формула «прохождения через экран» (0 — верх секции у нижнего
       края экрана, 1 — низ секции у верхнего края). ---------- */
  var PAR_MAX = 3; // потолок амплитуды параллакса, cqw (карта REPAIR_MAP_2707_v2, N5)
  var scrollEls = document.querySelectorAll(
    '.bottle[data-scroll-y0], .m-bottle[data-scroll-y0], .s8-word1[data-scroll-y0], [data-par]'
  );
  if (scrollEls.length && !reduceMotion) {
    var ticking = false;

    function sectionProgress(section, vh) {
      var rect = section.getBoundingClientRect();
      var firstScreen = section.classList.contains('s1') || section.classList.contains('m-s1');
      var p = firstScreen ? (-rect.top / rect.height) : ((vh - rect.top) / (rect.height + vh));
      return Math.max(0, Math.min(1, p));
    }

    function updateScroll() {
      var vh = window.innerHeight;
      scrollEls.forEach(function (el) {
        var section = el.closest('section');
        if (!section) return;
        var stage = el.closest('.stage,.stage--mobile');
        var w = stage ? stage.getBoundingClientRect().width : window.innerWidth;
        var progress = sectionProgress(section, vh);

        var y0attr = el.getAttribute('data-scroll-y0');
        if (y0attr !== null) {
          var y0 = parseFloat(y0attr);
          var y1 = parseFloat(el.getAttribute('data-scroll-y1'));
          var cqw = y0 + (y1 - y0) * progress;
          el.style.top = (w * cqw / 100).toFixed(1) + 'px';
        }

        var parAttr = el.getAttribute('data-par');
        if (parAttr !== null) {
          var amp = Math.min(PAR_MAX, parseFloat(parAttr));
          var offsetCqw = -amp / 2 + amp * progress;
          el.style.transform = 'translateY(' + (w * offsetCqw / 100).toFixed(2) + 'px)';
        }
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(updateScroll); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', updateScroll);
    updateScroll();
  }
})();
