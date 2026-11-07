(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  // メニュー（スマホ）
  var btn = document.querySelector('.menu-button');
  var nav = document.getElementById('global-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      document.body.style.overflow = open ? '' : 'hidden';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { btn.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); document.body.style.overflow = ''; }
    });
  }

  // ヘッダー：FV を過ぎたら紺の帯に
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  var note = document.querySelector('.mock-note');
  function onScrollHeader() {
    var limit = hero ? hero.offsetTop + hero.offsetHeight - 120 : 200;
    var solid = window.scrollY > limit;
    header.classList.toggle('is-solid', solid);
    header.style.top = solid ? '0px' : Math.max(0, (note ? note.offsetHeight : 0) - window.scrollY) + 'px';
  }
  window.addEventListener('resize', onScrollHeader);
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  // FV のスライド
  var slides = document.querySelectorAll('.hero-slides img');
  var dots = document.querySelectorAll('.hero-dots span');
  var current = 0;
  if (!reduce && slides.length > 1) {
    setInterval(function () {
      slides[current].classList.remove('is-active');
      dots[current] && dots[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
      if (dots[current]) { void dots[current].offsetWidth; dots[current].classList.add('is-active'); }
    }, 6000);
  }

  // コピーを1文字ずつに分ける
  var title = document.querySelector('[data-split]');
  if (title) {
    title.querySelectorAll('.line').forEach(function (line) {
      var text = line.textContent;
      line.setAttribute('aria-hidden', 'true');
      line.textContent = '';
      Array.prototype.forEach.call(text, function (ch) {
        var s = document.createElement('span');
        s.className = 'char';
        s.textContent = ch;
        line.appendChild(s);
      });
    });
    var sr = document.createElement('span');
    sr.textContent = '保険に、まっすぐ。人に、深く。';
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
    title.appendChild(sr);
  }

  var loader = document.querySelector('.loader');
  if (reduce || !hasGsap) {
    if (loader) loader.classList.add('is-done');
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.style.opacity = 1; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // 読み込み：ロゴ → 幕が上下に開く → コピーが1文字ずつ
  var tl = gsap.timeline();
  tl.from('.loader-logo', { opacity: 0, y: 12, duration: .6, ease: 'power2.out' })
    .to('.loader-logo', { opacity: 0, duration: .4, delay: .4 })
    .to('.loader-panel-top', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=.1')
    .to('.loader-panel-bottom', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<')
    .set(loader, { display: 'none' })
    .from('.hero-title .char', { yPercent: 110, opacity: 0, duration: .9, ease: 'expo.out', stagger: .045 }, '-=.5')
    .from('.hero-lead', { y: 20, opacity: 0, duration: .8, ease: 'power2.out' }, '-=.4')
    .from('.site-header, .hero-dots, .hero-scroll', { opacity: 0, duration: .6 }, '<');

  // 見出しや文章：下からせり上がる
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.from(el, {
      y: 48, opacity: 0, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  // 背景の大きな英字：スクロールで横に動く
  gsap.utils.toArray('.bg-word').forEach(function (el) {
    gsap.fromTo(el, { xPercent: 0 }, {
      xPercent: -18, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // FV：スクロールでコピーが少し上へ、写真が暗く
  gsap.to('.hero-inner', {
    y: -80, opacity: .2, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // 強み：写真の中で画像がゆっくり動く＋左の番号を切り替え
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    var cur = document.querySelector('.strengths-current');
    var bar = document.querySelector('.strengths-bar span');
    gsap.utils.toArray('.strength').forEach(function (item, i) {
      gsap.fromTo(item.querySelector('.strength-photo img'), { yPercent: -8 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true }
      });
      ScrollTrigger.create({
        trigger: item, start: 'top 55%', end: 'bottom 55%',
        onToggle: function (self) {
          if (self.isActive) { cur.textContent = '0' + (i + 1); bar.style.width = ((i + 1) / 3 * 100) + '%'; }
        }
      });
    });
  });

  // 強みの写真：斜めに切った形で現れる（CSS の transition。画面に入ったら1回だけ）
  var photos = document.querySelectorAll('.strength-photo');
  var pio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); pio.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -15% 0px' });
  photos.forEach(function (el) { el.classList.add('is-ready'); pio.observe(el); });

  // スタッフ：ドラッグで横に送る（PC）
  var list = document.querySelector('.staff-list');
  if (list) {
    var down = false, startX = 0, startLeft = 0;
    list.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; startX = e.clientX; startLeft = list.scrollLeft; list.classList.add('is-dragging');
    });
    window.addEventListener('pointerup', function () { down = false; list.classList.remove('is-dragging'); });
    window.addEventListener('pointermove', function (e) { if (down) list.scrollLeft = startLeft - (e.clientX - startX); });
    gsap.from('.staff-card', {
      x: 120, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1,
      scrollTrigger: { trigger: list, start: 'top 85%', once: true }
    });
  }
})();
