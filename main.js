document.documentElement.classList.add('loading');

(function() {
  var dot = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  var mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
  function ringLoop() { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(ringLoop); }
  ringLoop();
  document.querySelectorAll('[data-cursor="hover"], a, button, input').forEach(function(el) {
    el.addEventListener('mouseenter', function() { ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', function() { ring.classList.remove('hovering'); });
  });
})();

window.addEventListener('scroll', function() {
  var fill = document.getElementById('scrollProgress');
  if (!fill) return;
  var max = document.documentElement.scrollHeight - window.innerHeight;
  fill.style.width = (window.scrollY / max * 100) + '%';
});

window.addEventListener('load', function() {
  var fill = document.getElementById('loaderFill');
  var pct = document.getElementById('loaderPct');
  if (fill) fill.style.width = '100%';
  var n = 0;
  var pctTimer = setInterval(function() {
    n += Math.floor(Math.random() * 14) + 4;
    if (n >= 100) { n = 100; clearInterval(pctTimer); }
    if (pct) pct.textContent = n + '%';
  }, 110);
  setTimeout(function() {
    var loader = document.getElementById('loader');
    if (loader) loader.classList.add('done');
    document.documentElement.classList.remove('loading');
    playHeroIntro();
  }, 1800);
});

function playHeroIntro() {
  var lines = document.querySelectorAll('.h1-inner');
  lines.forEach(function(line, i) {
    setTimeout(function() {
      line.style.transition = 'transform 1.1s cubic-bezier(0.16,1,0.3,1)';
      line.style.transform = 'translateY(0)';
    }, i * 140);
  });
  setTimeout(function() { scrambleText(document.getElementById('scramble'), 'sell.'); }, 600);
  var fades = document.querySelectorAll('[data-anim="fade"]');
  fades.forEach(function(el, i) {
    setTimeout(function() {
      el.style.transition = 'opacity 1s ease, transform 1s cubic-bezier(0.16,1,0.3,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 400 + i * 120);
  });
  setTimeout(startHeroStats, 1200);
}

function scrambleText(el, finalText) {
  if (!el) return;
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@$';
  var frame = 0, totalFrames = 26;
  function tick() {
    var out = '';
    for (var i = 0; i < finalText.length; i++) {
      var revealAt = (i / finalText.length) * totalFrames * 0.7;
      if (frame > revealAt) out += finalText[i];
      else out += chars[Math.floor(Math.random() * chars.length)];
    }
    el.textContent = out;
    frame++;
    if (frame <= totalFrames) requestAnimationFrame(tick);
    else el.textContent = finalText;
  }
  tick();
}

function startHeroStats() {
  document.querySelectorAll('.hstat-num[data-count]').forEach(function(el) {
    var target = parseInt(el.dataset.count, 10);
    var suffix = el.dataset.suffix || '';
    var t0 = performance.now();
    function tick(now) {
      var prog = Math.min((now - t0) / 1600, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (prog < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

(function() {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h, dpr, t = 0;
  var mouse = { x: -9999, y: -9999 };
  var COLS = 48, ROWS = 26;
  function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function project(col, row, time) {
    var nx = col / (COLS - 1), ny = row / (ROWS - 1);
    var z = Math.sin(nx * 6 + time * 0.8) * 14 + Math.cos(ny * 5 - time * 0.6) * 12 + Math.sin((nx + ny) * 4 + time * 1.1) * 8;
    var px = nx * w, py = h * 0.32 + ny * h * 0.78 + z;
    var depth = 0.45 + ny * 0.55;
    px = w / 2 + (px - w / 2) * depth;
    var dx = px - mouse.x, dy = py - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 170 && dist > 0) { var force = (170 - dist) / 170; px += (dx / dist) * force * 26; py += (dy / dist) * force * 26; }
    return { x: px, y: py, z: z, depth: depth };
  }
  function step() {
    ctx.clearRect(0, 0, w, h); t += 0.016;
    var points = [];
    for (var r = 0; r < ROWS; r++) { points[r] = []; for (var c = 0; c < COLS; c++) points[r][c] = project(c, r, t); }
    for (var r2 = 0; r2 < ROWS; r2++) {
      ctx.beginPath();
      for (var c2 = 0; c2 < COLS; c2++) { var p = points[r2][c2]; if (c2 === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
      ctx.strokeStyle = 'rgba(184,155,110,' + (0.04 + (r2 / ROWS) * 0.1) + ')'; ctx.lineWidth = 0.7; ctx.stroke();
    }
    for (var c3 = 0; c3 < COLS; c3 += 2) {
      ctx.beginPath();
      for (var r3 = 0; r3 < ROWS; r3++) { var p2 = points[r3][c3]; if (r3 === 0) ctx.moveTo(p2.x, p2.y); else ctx.lineTo(p2.x, p2.y); }
      ctx.strokeStyle = 'rgba(184,155,110,0.05)'; ctx.lineWidth = 0.6; ctx.stroke();
    }
    for (var r4 = 0; r4 < ROWS; r4 += 2) {
      for (var c4 = 0; c4 < COLS; c4 += 2) {
        var p3 = points[r4][c4]; var glow = Math.max(0, p3.z) / 34; var size = 0.8 + glow * 1.6 + p3.depth * 0.6;
        ctx.beginPath(); ctx.arc(p3.x, p3.y, size, 0, Math.PI * 2); ctx.fillStyle = 'rgba(212,188,146,' + (0.1 + glow * 0.45) + ')'; ctx.fill();
      }
    }
    requestAnimationFrame(step);
  }
  var heroEl = document.querySelector('.hero');
  heroEl.addEventListener('mousemove', function(e) { var rect = canvas.getBoundingClientRect(); mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; });
  heroEl.addEventListener('mouseleave', function() { mouse.x = -9999; mouse.y = -9999; });
  resize(); step(); window.addEventListener('resize', resize);
})();

window.addEventListener('scroll', function() {
  var y = window.scrollY;
  var h1 = document.querySelector('.hero-h1');
  var bottom = document.querySelector('.hero-bottom');
  if (h1 && y < window.innerHeight) { h1.style.transform = 'translateY(' + y * 0.2 + 'px)'; h1.style.opacity = 1 - (y / window.innerHeight) * 1.2; }
  if (bottom && y < window.innerHeight) bottom.style.transform = 'translateY(' + y * 0.1 + 'px)';
});

var navbar = document.getElementById('navbar');
window.addEventListener('scroll', function() { navbar.classList.toggle('scrolled', window.scrollY > 80); });

var hamburger = document.getElementById('hamburger');
var mobileMenu = document.getElementById('mobileMenu');
var mobClose = document.getElementById('mobClose');
hamburger.addEventListener('click', function() { mobileMenu.classList.add('open'); document.body.style.overflow = 'hidden'; });
mobClose.addEventListener('click', closeMob);
function closeMob() { mobileMenu.classList.remove('open'); document.body.style.overflow = ''; }
mobileMenu.querySelectorAll('a').forEach(function(a) { a.addEventListener('click', closeMob); });

(function() {
  var track = document.getElementById('marqueeTrack');
  if (!track) return;
  var offset = 0, baseSpeed = 0.6, lastScroll = window.scrollY, boost = 0, trackWidth = 0;
  setTimeout(function() { trackWidth = track.scrollWidth / 2; }, 200);
  window.addEventListener('scroll', function() { var delta = Math.abs(window.scrollY - lastScroll); boost = Math.min(delta * 0.45, 14); lastScroll = window.scrollY; });
  function loop() { offset -= (baseSpeed + boost); boost *= 0.92; if (trackWidth && Math.abs(offset) >= trackWidth) offset += trackWidth; track.style.transform = 'translateX(' + offset + 'px)'; requestAnimationFrame(loop); }
  loop();
})();

(function() {
  var words = document.querySelectorAll('.stmt-word');
  if (!words.length) return;
  var section = document.querySelector('.stmt-section');
  window.addEventListener('scroll', function() {
    var rect = section.getBoundingClientRect(); var vh = window.innerHeight;
    var progress = 1 - (rect.top + rect.height * 0.3) / vh;
    progress = Math.max(0, Math.min(1, progress));
    var litCount = Math.floor(progress * words.length * 1.3);
    words.forEach(function(word, i) { word.classList.toggle('lit', i < litCount); });
  });
})();

var revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });

function countUp(el, target) {
  var t0 = performance.now(); var dur = 1400; var plus = el.textContent.indexOf('+') !== -1;
  function tick(now) {
    var prog = Math.min((now - t0) / dur, 1); var eased = 1 - Math.pow(1 - prog, 3); var val = Math.floor(eased * target);
    el.textContent = 'AED ' + val.toLocaleString() + (plus ? '+' : '');
    if (prog < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
var priceObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) { if (entry.isIntersecting) { countUp(entry.target, parseInt(entry.target.dataset.count, 10)); priceObserver.unobserve(entry.target); } });
}, { threshold: 0.6 });
document.querySelectorAll('.price-setup[data-count]').forEach(function(el) { priceObserver.observe(el); });

var openCard = null;
function toggleCard(id) {
  var cardEl = document.getElementById('card-' + id);
  if (!cardEl) return;
  if (openCard && openCard !== cardEl) openCard.classList.remove('open');
  if (cardEl.classList.contains('open')) { cardEl.classList.remove('open'); openCard = null; }
  else { cardEl.classList.add('open'); openCard = cardEl; }
}

document.querySelectorAll('.pkg-card').forEach(function(card) {
  var glow = card.querySelector('.card-glow');
  card.addEventListener('mousemove', function(e) {
    var rect = card.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
    if (card.classList.contains('open')) return;
    var rotY = ((x / rect.width) - 0.5) * 7, rotX = (0.5 - (y / rect.height)) * 7;
    card.style.transform = 'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-4px)';
  });
  card.addEventListener('mouseleave', function() { card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)'; });
});

(function() {
  var slider = document.getElementById('revSlider');
  if (!slider) return;
  var revEl = document.getElementById('calcRevenue'), lossEl = document.getElementById('calcLoss'), keepEl = document.getElementById('calcKeep'), saveEl = document.getElementById('calcSave');
  var COMMISSION = 0.30, STORE_YEARLY = 1799 * 12 + 8000;
  function fmt(n) { return 'AED ' + Math.round(n).toLocaleString(); }
  function update() {
    var monthly = parseInt(slider.value, 10);
    var yearlyLoss = monthly * 12 * COMMISSION;
    var saved = yearlyLoss - STORE_YEARLY;
    revEl.textContent = fmt(monthly); lossEl.textContent = fmt(yearlyLoss); keepEl.textContent = fmt(STORE_YEARLY);
    saveEl.textContent = saved > 0 ? fmt(saved) : 'AED 0';
  }
  slider.addEventListener('input', update); update();
})();

(function() {
  var steps = document.querySelectorAll('.step');
  var counter = document.getElementById('stepCurrent');
  if (!steps.length) return;
  var stepObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { steps.forEach(function(s) { s.classList.remove('active'); }); entry.target.classList.add('active'); if (counter) counter.textContent = entry.target.dataset.step; }
    });
  }, { threshold: 0.6, rootMargin: '-15% 0px -15% 0px' });
  steps.forEach(function(s) { stepObserver.observe(s); });
})();

document.querySelectorAll('.magnetic').forEach(function(btn) {
  btn.addEventListener('mousemove', function(e) {
    var rect = btn.getBoundingClientRect();
    var x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = 'translate(' + x * 0.28 + 'px,' + y * 0.4 + 'px)';
  });
  btn.addEventListener('mouseleave', function() { btn.style.transform = 'translate(0,0)'; btn.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)'; });
  btn.addEventListener('mouseenter', function() { btn.style.transition = 'transform 0.1s ease-out'; });
});

(function() {
  var bgText = document.getElementById('ctaBg');
  var ctaSection = document.querySelector('.cta-section');
  if (!bgText || !ctaSection) return;
  window.addEventListener('scroll', function() {
    var rect = ctaSection.getBoundingClientRect(); var vh = window.innerHeight;
    if (rect.top < vh && rect.bottom > 0) { var prog = (vh - rect.top) / (vh + rect.height); bgText.style.transform = 'translate(-50%, -50%) scale(' + (0.85 + prog * 0.35) + ')'; }
  });
})();