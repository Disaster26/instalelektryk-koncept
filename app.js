(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var strz = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h10M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>';

  var rok = document.getElementById('rok');
  if (rok) rok.textContent = new Date().getFullYear();

  /* menu mobilne */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu-mob');
  function zamknij() { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var otw = menu.hidden;
    menu.hidden = !otw;
    burger.setAttribute('aria-expanded', String(otw));
    burger.setAttribute('aria-label', otw ? 'Zamknij menu' : 'Otwórz menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { zamknij(); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1180 && !menu.hidden) zamknij(); });

  /* karuzele zdjec w kartach: palec (natywnie), mysz (przeciaganie), strzalki, klawiatura */
  document.querySelectorAll('[data-car]').forEach(function (car) {
    var tor = car.querySelector('.car-tor');
    var el = tor.children, n = el.length;
    if (n < 2) return;
    car.setAttribute('data-wiele', '');
    tor.setAttribute('tabindex', '0');
    tor.setAttribute('aria-label', 'Zdjęcia - przewiń w bok');
    var nr = document.createElement('span'); nr.className = 'car-nr'; car.appendChild(nr);
    var l = document.createElement('button'); l.type = 'button'; l.className = 'car-btn l'; l.innerHTML = strz; l.setAttribute('aria-label', 'Poprzednie zdjęcie');
    var p = document.createElement('button'); p.type = 'button'; p.className = 'car-btn p'; p.innerHTML = strz; p.setAttribute('aria-label', 'Następne zdjęcie');
    car.appendChild(l); car.appendChild(p);
    function krok() { return tor.clientWidth; }
    function odswiez() {
      var i = Math.round(tor.scrollLeft / krok());
      nr.textContent = (Math.min(i, n - 1) + 1) + ' / ' + n;
      l.disabled = tor.scrollLeft < 4;
      p.disabled = tor.scrollLeft > tor.scrollWidth - tor.clientWidth - 4;
    }
    function idz(d) { tor.scrollBy({ left: d * krok(), behavior: reduce ? 'auto' : 'smooth' }); }
    l.addEventListener('click', function () { idz(-1); });
    p.addEventListener('click', function () { idz(1); });
    tor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); idz(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); idz(-1); }
    });
    tor.addEventListener('scroll', function () { window.requestAnimationFrame(odswiez); }, { passive: true });
    window.addEventListener('resize', odswiez);

    var start = null, sl = 0, ruch = false;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      start = e.clientX; sl = tor.scrollLeft; ruch = false;
    });
    tor.addEventListener('pointermove', function (e) {
      if (start === null) return;
      var dx = e.clientX - start;
      if (!ruch && Math.abs(dx) > 5) { ruch = true; car.classList.add('ciag'); try { tor.setPointerCapture(e.pointerId); } catch (x) {} }
      if (ruch) tor.scrollLeft = sl - dx;
    });
    function koniec() {
      if (start === null) return;
      start = null;
      if (ruch) {
        car.classList.remove('ciag');
        var k = krok(), cel = Math.round(tor.scrollLeft / k) * k;
        tor.scrollTo({ left: cel, behavior: reduce ? 'auto' : 'smooth' });
        setTimeout(function () { ruch = false; }, 0);
      }
    }
    tor.addEventListener('pointerup', koniec);
    tor.addEventListener('pointercancel', koniec);
    tor.addEventListener('click', function (e) { if (ruch) { e.preventDefault(); e.stopPropagation(); } }, true);
    odswiez();
  });

  /* dolny pasek na telefonie: dopiero po minieciu przycisku w hero */
  var pasek = document.querySelector('.mob-pasek');
  var heroBtn = document.querySelector('.hero-akcje');
  if (pasek && heroBtn && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (w) {
      var wid = !w[0].isIntersecting && w[0].boundingClientRect.top < 0;
      pasek.classList.toggle('widac', wid);
      pasek.setAttribute('aria-hidden', String(!wid));
      pasek.querySelectorAll('a').forEach(function (a) { a.tabIndex = wid ? 0 : -1; });
    }).observe(heroBtn);
  }

  /* aktywna pozycja menu */
  var linki = document.querySelectorAll('.nav a[href^="#"]');
  var mapa = {};
  linki.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) mapa[s.id] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) {
        if (!w.isIntersecting) return;
        linki.forEach(function (a) { a.classList.remove('on'); a.removeAttribute('aria-current'); });
        var a = mapa[w.target.id];
        if (a) { a.classList.add('on'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* formularz pokazowy */
  var form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var info = form.querySelector('.form-info');
      if (!form.checkValidity()) { info.textContent = 'Uzupełnij imię, kontakt i zaznacz zgodę.'; return; }
      info.textContent = 'To podgląd projektu - formularz nie wysyła jeszcze wiadomości. Na gotowej stronie zapytanie trafi na m.baczek@instal-elektryk.com.pl.';
    });
  }
  /* lista obiektow - pokaz wszystkie */
  var lb = document.querySelector('.btn-wiecej');
  var lista = document.getElementById('lista-obiektow');
  if (lb && lista) {
    lb.addEventListener('click', function () {
      var otw = lista.classList.toggle('otw');
      lb.setAttribute('aria-expanded', String(otw));
      lb.textContent = otw ? 'Pokaż mniej' : 'Pokaż wszystkie obiekty (18)';
      if (!otw) lista.scrollIntoView({ block: 'start' });
    });
  }
})();
