/* ==================== GELTEK HAIR — пиксель-перенос: анимации ==================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Появление блоков при скролле (reveal) ---------- */
  /* Элементы с data-par (движение по прокрутке из аннотаций макета) в этот список НЕ входят:
     обработчик прокрутки пишет им inline-transform, который перебивает transform класса .reveal —
     появление «выездом» не отрабатывало бы, оставался бы только fade. Движение из макета важнее
     нашей добавки-появления, поэтому у .s2/.s3/.s4 .card и .s10-title остаётся только параллакс. */
  var revealSelectors = [
    '.s1 .adv-card', '.s5 .card',
    '.s6 .plate', '.s6 .shopbtn', '.s7 .s7card', '.s8 .s8-btn', '.s8 .s8-photo',
    '.s9 .r-banner', '.s9 .v-banner',
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
  /* ---------- Бургер мобильного хедера + выпадающее меню ---------- */
  var burger = document.querySelector('.m-burger');
  var mHdr = burger ? burger.closest('.m-hdr') : null;
  if (burger && mHdr) {
    /* переключение вынесено в функцию: одно поведение для мыши и клавиатуры,
       aria-expanded держится в актуальном состоянии для программ чтения с экрана */
    function toggleMenu(force) {
      var open = (typeof force === 'boolean') ? force : !mHdr.classList.contains('menu-open');
      burger.classList.toggle('is-open', open);
      mHdr.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });
    /* клавиатура: бургер — span с role="button", сам по себе Enter/Space не обрабатывает */
    burger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      } else if (e.key === 'Escape') {
        toggleMenu(false);
      }
    });
    /* клик по пункту меню — закрыть после перехода */
    mHdr.querySelectorAll('.m-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggleMenu(false);
      });
    });
    /* клик вне меню — закрыть */
    document.addEventListener('click', function (e) {
      if (mHdr.classList.contains('menu-open') && !mHdr.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  /* ---------- Мобильная: раскрывающиеся группы блока «Как действует сыворотка» ----------
     Обе группы свёрнуты при загрузке (классы на секции заданы в разметке). Нажатие на рамку
     заголовка или сам заголовок переключает свою группу; знак «+» меняется на «–» правилом CSS,
     положение нижележащих элементов и высота плашки — переменными --hA/--hB. */
  var accSec = document.querySelector('.m-s5');
  if (accSec) {
    var toggleAcc = function (key) {
      var closed = accSec.classList.toggle('acc-' + key + '-closed');
      accSec.querySelectorAll('[data-acc="' + key + '"]').forEach(function (n) {
        n.setAttribute('aria-expanded', closed ? 'false' : 'true');
      });
    };
    accSec.querySelectorAll('[data-acc]').forEach(function (el) {
      el.addEventListener('click', function () {
        toggleAcc(el.getAttribute('data-acc'));
      });
      /* клавиатура: рамка и заголовок — не кнопки, Enter/Space сами не срабатывают */
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          toggleAcc(el.getAttribute('data-acc'));
        }
      });
    });
  }

  /* ---------- Единый обработчик прокрутки: два типа эффектов на элементах секций ----------
     - data-scroll-y0/y1 — абсолютная интерполяция top: флакон hero, логотип GELTEK в блоке
       «Доверие» (один векторный элемент, движется тем же механизмом);
     - data-par="<амплитуда в cqw>" — относительное смещение translateY от 0 до +амплитуда
       (декоративный «лёгкий эффект движения» экранов 2/3/4/5/6/7/10). Базовая амплитуда —
       длина стрелки из соответствующей аннотации макета (px/19.2), потолок не применяется:
       он гасил бы значения 24.531/27.031/12.969 почти до нуля, и эффект стал бы «почти
       незаметен» везде, кроме первого экрана (тот идёт по отдельному механизму
       data-scroll-y0/y1). Часть амплитуд согласованно снижена против макетных, чтобы движение
       читалось спокойнее: плашки экранов 2/3/4 — вдвое (24.531 → 12.266), круги «до/после»
       экрана 7 — на 60% (12.969 → 5.188). Отсчёт от 0, а не от -амплитуда/2: элемент обязан
       стоять в макетной (нулевой) позиции в момент входа секции в кадр, а не с уже наполовину
       пройденным смещением;
     - data-dim="<начальная яркость 0..1>" — вторая половина аннотаций экранов 2/3/4/10: «+ уходит
       лёгкое затемнение изображения» — фото стартует чуть темнее (brightness(data-dim)) и
       высветляется до нормального (brightness(1)) по мере прохождения секции через экран, по той
       же progress, что и соседний data-par.

     Прогресс прохождения секции через экран считается двумя формулами:
     - первый экран (.s1/.m-s1): флакон не должен быть смещён/полупрозрачным на старте страницы,
       поэтому прогресс считаем от начала страницы: 0 — секция не прокручена (элемент в исходной
       позиции), 1 — секция ушла вверх на свою высоту;
     - остальные секции: формула «прохождения через экран» (0 — верх секции у нижнего края
       экрана, 1 — низ секции у верхнего края). ---------- */
  var scrollEls = document.querySelectorAll(
    '.bottle[data-scroll-y0], .m-bottle[data-scroll-y0], .s8-logo[data-scroll-y0], [data-par], [data-dim]'
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
          /* data-scroll-speed — множитель скорости: элемент проходит весь путь за 1/speed доли
             прокрутки секции и дальше стоит на конечной отметке (у флакона первого экрана
             конечная точка согласована отдельно) */
          var speed = parseFloat(el.getAttribute('data-scroll-speed'));
          if (!(speed > 0)) { speed = 1; }   /* ноль, отрицательное и нечисловое → обычная скорость */
          var p = Math.min(1, progress * speed);
          /* Смещение задаётся трансформацией, а не свойством top: top пересчитывает раскладку и
             перерисовывает область каждый кадр, из-за чего при быстрой прокрутке (протяжка
             ползунка) движение отстаёт от страницы рывками. Трансформация выполняется на
             отдельном слое, поэтому элемент едет ровно. Стартовое положение y0 остаётся
             в стилях как обычный top, здесь считается только смещение от него. */
          var dyCqw = (y1 - y0) * p;
          el.style.transform = 'translate3d(0,' + (w * dyCqw / 100).toFixed(2) + 'px,0)';
        }

        var parAttr = el.getAttribute('data-par');
        if (parAttr !== null) {
          var amp = parseFloat(parAttr);
          /* offsetCqw=0 при progress=0 (секция только вошла в кадр) — элемент стоит ровно в
             макетной позиции в этот момент, дальше уезжает на всю амплитуду */
          var offsetCqw = amp * progress;
          el.style.transform = 'translateY(' + (w * offsetCqw / 100).toFixed(2) + 'px)';
        }

        var dimAttr = el.getAttribute('data-dim');
        if (dimAttr !== null) {
          var dim0 = parseFloat(dimAttr);
          var brightness = dim0 + (1 - dim0) * progress;
          el.style.filter = 'brightness(' + brightness.toFixed(3) + ')';
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
