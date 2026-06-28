/* ============================================================
   BBC English Academy — script.js (UPDATED with Login & Enhanced Form)
   ============================================================ */

'use strict';

/* ==============================
   CONFIGURATION
   ============================== */
var API_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL';

/* ==============================
   LOADING SCREEN
   ============================== */
window.addEventListener('load', function () {
  setTimeout(function () {
    var loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(function () { loader.style.display = 'none'; }, 600);
    }
    revealAll();
  }, 2200);
});

/* ==============================
   LOGIN MODAL
   ============================== */
var loginModal = document.getElementById('login-modal');
var loginOpenBtn = document.getElementById('nav-login-btn');
var loginCloseBtn = document.getElementById('login-close');

if (loginOpenBtn) {
  loginOpenBtn.addEventListener('click', function(e) {
    e.preventDefault();
    loginModal.classList.add('open');
  });
}

if (loginCloseBtn) {
  loginCloseBtn.addEventListener('click', function() {
    loginModal.classList.remove('open');
  });
}

if (loginModal) {
  loginModal.addEventListener('click', function(e) {
    if (e.target === loginModal) {
      loginModal.classList.remove('open');
    }
  });
}

document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  var username = document.getElementById('login-username').value.trim();
  var password = document.getElementById('login-password').value;
  var btn = this.querySelector('button[type="submit"]');
  var originalText = btn.querySelector('span').textContent;

  btn.disabled = true;
  btn.querySelector('span').textContent = 'Logging in...';

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username: username, password: password })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    btn.disabled = false;
    btn.querySelector('span').textContent = originalText;

    if (data.success) {
      sessionStorage.setItem('bbcAuth', JSON.stringify(data));
      loginModal.classList.remove('open');
      
      if (data.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      alert(data.error || 'Login failed. Please try again.');
    }
  })
  .catch(function(err) {
    btn.disabled = false;
    btn.querySelector('span').textContent = originalText;
    alert('Connection error. Please try again.');
  });
});

/* ==============================
   MOUSE GLOW EFFECT
   ============================== */
var mouseGlow = document.createElement('div');
mouseGlow.className = 'mouse-glow';
document.body.appendChild(mouseGlow);

document.addEventListener('mousemove', function (e) {
  mouseGlow.style.left = e.clientX + 'px';
  mouseGlow.style.top  = e.clientY + 'px';
});

/* ==============================
   PARTICLE CANVAS
   ============================== */
(function () {
  var canvas  = document.getElementById('particles-canvas');
  if (!canvas) return;
  var ctx     = canvas.getContext('2d');
  var particles = [];
  var mouse   = { x: -9999, y: -9999 };

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = (Math.random() - 0.5) * 0.35;
    this.r  = Math.random() * 1.5 + 0.4;
    this.alpha = Math.random() * 0.5 + 0.15;
    this.color = Math.random() > 0.7 ? '#D60000' : '#ffffff';
  };
  Particle.prototype.update = function () {
    var dx = this.x - mouse.x;
    var dy = this.y - mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      var force = (100 - dist) / 100;
      this.vx += (dx / dist) * force * 0.3;
      this.vy += (dy / dist) * force * 0.3;
    }
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width)  this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  };
  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  var COUNT = window.innerWidth < 768 ? 60 : 130;
  for (var i = 0; i < COUNT; i++) particles.push(new Particle());

  function connectParticles() {
    for (var a = 0; a < particles.length; a++) {
      for (var b = a + 1; b < particles.length; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.strokeStyle = 'rgba(214,0,0,' + (0.04 * (1 - dist / 90)) + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ==============================
   NAVBAR — scroll + active link
   ============================== */
var navbar    = document.getElementById('navbar');
var hamburger = document.getElementById('hamburger');
var navLinks  = document.getElementById('nav-links');
var allLinks  = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', function () {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveLink();
  toggleBackToTop();
}, { passive: true });

hamburger.addEventListener('click', function () {
  var open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});

/* Close nav on link click (mobile) */
allLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

function updateActiveLink() {
  var scrollY = window.scrollY + 100;
  var sections = document.querySelectorAll('section[id]');
  sections.forEach(function (sec) {
    var top = sec.offsetTop;
    var bottom = top + sec.offsetHeight;
    var id = sec.getAttribute('id');
    var link = document.querySelector('.nav-link[href="#' + id + '"]');
    if (link) {
      if (scrollY >= top && scrollY < bottom) {
        allLinks.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
    }
  });
}

/* ==============================
   SMOOTH SCROLL
   ============================== */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      var offset = 72;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
});

/* ==============================
   SCROLL REVEAL
   ============================== */
function revealAll() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        var delay = (i % 6) * 80;
        setTimeout(function () {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-fade').forEach(function (el) {
    observer.observe(el);
  });
}

/* ==============================
   ANIMATED STAT COUNTERS
   ============================== */
function animateCounter(el) {
  var target = parseInt(el.getAttribute('data-target'), 10);
  var duration = 2000;
  var start = performance.now();
  function tick(now) {
    var elapsed = now - start;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.floor(eased * target);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString() + (el.parentElement.querySelector('.stat-label').textContent.includes('%') ? '' : target >= 1000 ? '+' : target < 100 && !el.parentElement.querySelector('.stat-label').textContent.includes('Years') ? '%' : '');
  }
  requestAnimationFrame(tick);
}

var statObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(function (el) {
  statObserver.observe(el);
});

/* ==============================
   COURSE FILTERS
   ============================== */
document.querySelectorAll('.filter-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.course-card').forEach(function (card) {
      var cat = card.getAttribute('data-category');
      var show = filter === 'all' || cat === filter;
      card.style.display = show ? '' : 'none';
      if (show) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(function () {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 20);
      }
    });
  });
});

/* ==============================
   TESTIMONIAL SLIDER
   ============================== */
(function () {
  var track  = document.getElementById('testimonial-track');
  var dotsEl = document.getElementById('testi-dots');
  var prev   = document.getElementById('testi-prev');
  var next   = document.getElementById('testi-next');
  if (!track) return;

  var cards  = track.querySelectorAll('.testimonial-card');
  var total  = cards.length;
  var perView = window.innerWidth < 768 ? 1 : 3;
  var current = 0;
  var autoTimer;

  function getPerView() {
    return window.innerWidth < 768 ? 1 : 3;
  }

  function buildDots() {
    dotsEl.innerHTML = '';
    var groups = Math.ceil(total / getPerView());
    for (var i = 0; i < groups; i++) {
      (function (idx) {
        var dot = document.createElement('button');
        dot.className = 'testi-dot' + (idx === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (idx + 1));
        dot.addEventListener('click', function () { goTo(idx); });
        dotsEl.appendChild(dot);
      })(i);
    }
  }

  function goTo(idx) {
    perView = getPerView();
    var maxIndex = Math.max(0, Math.ceil(total / perView) - 1);
    current = Math.max(0, Math.min(idx, maxIndex));
    var cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = 'translateX(-' + (current * cardWidth * perView) + 'px)';
    dotsEl.querySelectorAll('.testi-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === current);
    });
    clearInterval(autoTimer);
    autoTimer = setInterval(autoNext, 5000);
  }

  function autoNext() {
    perView = getPerView();
    var maxIndex = Math.ceil(total / perView) - 1;
    goTo(current >= maxIndex ? 0 : current + 1);
  }

  prev.addEventListener('click', function () {
    perView = getPerView();
    var maxIndex = Math.ceil(total / perView) - 1;
    goTo(current <= 0 ? maxIndex : current - 1);
  });
  next.addEventListener('click', function () { autoNext(); });

  buildDots();
  autoTimer = setInterval(autoNext, 5000);

  window.addEventListener('resize', function () {
    buildDots();
    goTo(0);
  });

  /* Touch/swipe */
  var touchStartX = 0;
  track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) dx < 0 ? autoNext() : goTo(current - 1);
  }, { passive: true });
})();

/* ==============================
   GALLERY LIGHTBOX
   ============================== */
(function () {
  var lightbox = document.getElementById('lightbox');
  var lbContent = document.getElementById('lb-content');
  var lbClose  = document.getElementById('lb-close');
  var lbPrev   = document.getElementById('lb-prev');
  var lbNext   = document.getElementById('lb-next');
  if (!lightbox) return;

  var items    = document.querySelectorAll('.gallery-item');
  var current  = 0;

  var labels = [
    'Modern Classrooms','Speaking Labs','Student Workshops',
    'Graduation Ceremony','Group Activities','Library & Study Hub'
  ];
  var gradients = [
    'linear-gradient(160deg,#3d0000,#800000,#500000)',
    'linear-gradient(160deg,#001840,#003580,#001540)',
    'linear-gradient(160deg,#0f3500,#246000,#0a2800)',
    'linear-gradient(160deg,#3d1500,#803000,#502000)',
    'linear-gradient(160deg,#1a0040,#3a0080,#120030)',
    'linear-gradient(160deg,#003030,#006060,#002020)'
  ];

  function open(idx) {
    current = idx;
    lbContent.style.background = gradients[idx % gradients.length];
    lbContent.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;"><span style="font-size:3rem;opacity:0.3;">🏛️</span><p style="font-size:1.1rem;font-weight:600;color:#fff;letter-spacing:0.06em;">' + labels[idx] + '</p><p style="color:#888;font-size:0.82rem;">BBC English Academy</p></div>';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function navigate(dir) {
    current = (current + dir + items.length) % items.length;
    open(current);
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () { open(i); });
  });
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', function () { navigate(-1); });
  lbNext.addEventListener('click', function () { navigate(1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();

/* ==============================
   FAQ ACCORDION
   ============================== */
document.querySelectorAll('.faq-question').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.parentElement;
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(function (fi) { fi.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
  });
});

/* ==============================
   CONTACT FORM (ENHANCED)
   ============================== */
var form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    
    var name  = document.getElementById('cf-name').value.trim();
    var email = document.getElementById('cf-email').value.trim();
    var phone = document.getElementById('cf-phone').value.trim();
    var course = document.getElementById('cf-course').value;
    var level = document.getElementById('cf-level').value;
    var hear = document.getElementById('cf-hear').value;
    var goal = document.getElementById('cf-goal').value;
    var schedule = document.getElementById('cf-schedule').value;
    var message = document.getElementById('cf-message').value.trim();
    
    if (!name || !email) {
      alert('Please fill in all required fields.');
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    var originalText = btn.querySelector('span').textContent;
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    var formData = {
      action: 'submitApplication',
      fullName: name,
      email: email,
      phone: phone,
      courseInterest: course,
      currentLevel: level,
      hearAboutUs: hear,
      goal: goal,
      preferredSchedule: schedule,
      message: message
    };

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      btn.disabled = false;
      btn.querySelector('span').textContent = originalText;

      if (data.success) {
        document.getElementById('form-success').classList.add('show');
        form.reset();
        setTimeout(function () {
          document.getElementById('form-success').classList.remove('show');
        }, 6000);
      } else {
        alert(data.error || 'Failed to submit application. Please try again.');
      }
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.querySelector('span').textContent = originalText;
      alert('Connection error. Please try again.');
    });
  });
}

/* ==============================
   BACK TO TOP
   ============================== */
var btt = document.getElementById('back-to-top');
function toggleBackToTop() {
  if (btt) btt.classList.toggle('visible', window.scrollY > 400);
}
if (btt) {
  btt.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==============================
   HERO PARALLAX (subtle)
   ============================== */
window.addEventListener('scroll', function () {
  var hero = document.querySelector('.hero-content');
  if (hero) {
    var offset = window.scrollY;
    hero.style.transform = 'translateY(' + offset * 0.18 + 'px)';
    hero.style.opacity = Math.max(0, 1 - offset / 500);
  }
}, { passive: true });

/* ==============================
   INITIAL STATE — run on DOMContentLoaded
   ============================== */
document.addEventListener('DOMContentLoaded', function () {
  updateActiveLink();
  toggleBackToTop();
});