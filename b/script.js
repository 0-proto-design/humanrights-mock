(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // メニュー（スマホ）
  var btn = document.querySelector('.menu-button');
  var nav = document.getElementById('global-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { btn.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
    });
  }

  // ヘッダーの線
  var header = document.querySelector('.site-header');
  function onScrollHeader() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  // スクロールで下からふわっと出る
  var fades = document.querySelectorAll('[data-fade]');
  if (reduce || !('IntersectionObserver' in window)) {
    fades.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    fades.forEach(function (el) { io.observe(el); });
  }

  // 強みの写真の軽い視差（このページでスクロール連動はここだけ）
  var para = document.querySelectorAll('[data-parallax] img');
  if (!reduce && para.length) {
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      para.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh; // -1〜1
        img.style.transform = 'translateY(' + (p * -24).toFixed(1) + 'px)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  // スタッフの送りボタン
  var list = document.querySelector('.staff-list');
  var prev = document.querySelector('.staff-prev');
  var next = document.querySelector('.staff-next');
  if (list && prev && next) {
    function step() { var c = list.querySelector('.staff-card'); return c ? c.offsetWidth + 40 : 340; }
    prev.addEventListener('click', function () { list.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { list.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
  }
})();
