// mobile menu
(function () {
  var btn = document.querySelector(".menu-btn");
  var nav = document.querySelector("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); });
    });
  }
})();

// close mobile menu on any in-page anchor click; let the browser handle scrolling natively
(function () {
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var nav = document.querySelector("nav");
    var btn = document.querySelector(".menu-btn");
    if (nav) nav.classList.remove("open");
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
})();

// sticky nav state
(function () {
  var nav = document.querySelector(".nav");
  if (!nav) return;
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// contact form (Web3Forms) — only email + phone mandatory
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.elements["email"], phone = form.elements["phone"];
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    var phoneOk = phone.value.replace(/\D/g, "").length >= 10;
    form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
    if (!emailOk) email.classList.add("invalid");
    if (!phoneOk) phone.classList.add("invalid");
    if (!emailOk || !phoneOk) {
      var first = form.querySelector(".invalid"); if (first) first.focus();
      var missing = [];
      if (!emailOk) missing.push("a valid email");
      if (!phoneOk) missing.push("a valid 10-digit phone number");
      status.className = "err";
      status.textContent = "Please fill in " + missing.join(" and ") + ".";
      return;
    }
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.className = "";
    status.textContent = "Sending...";
    fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.success) { status.className = "ok"; status.textContent = "Thank you! We have received your message and will get back to you soon."; form.reset(); }
        else { throw new Error(d.message || "Failed"); }
      })
      .catch(function () { status.className = "err"; status.textContent = "Could not send right now. Please call us or message on WhatsApp."; })
      .finally(function () { btn.disabled = false; });
  });
})();

// entrance animations (opacity/transform only — GPU cheap)
(function () {
  var html = document.documentElement;
  html.classList.add("js");
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  function tag(el, dir, delay) {
    if (!el || el.classList.contains("rv")) return;
    el.classList.add("rv");
    if (dir) el.classList.add(dir);
    if (delay) el.style.animationDelay = delay + "ms";
    io.observe(el);
  }

  // hero: text slides in (buttons are NOT animated — clickable immediately)
  document.querySelectorAll(".hero-content > *").forEach(function (el, i) {
    if (el.classList.contains("hero-actions")) return;
    tag(el, i % 2 === 0 ? "l" : "r", i * 80);
  });
  document.querySelectorAll(".hero-stats > div").forEach(function (el, i) { tag(el, i % 2 === 0 ? "l" : "r", i * 80); });

  // sections
  document.querySelectorAll("section .container > *, section .container .section-head > *").forEach(function (el) {
    if (el.classList.contains("rv")) return;
    if (el.classList.contains("hero-actions")) return;
    if (el.classList.contains("grid3") || el.classList.contains("grid2") || el.classList.contains("details-grid") || el.classList.contains("team-grid") || el.classList.contains("contact-grid") || el.classList.contains("client-grid")) {
      Array.prototype.forEach.call(el.children, function (c, i) {
        if (c.classList.contains("card")) return; // keep card buttons visible & clickable immediately
        tag(c, i % 2 === 0 ? "l" : "r", Math.min(i * 110, 440));
      });
    } else if (el.classList.contains("split-block")) {
      var kids = el.children;
      tag(kids[0], "l", 0);
      tag(kids[1], "r", 140);
    } else if (el.classList.contains("core-team")) {
      Array.prototype.forEach.call(el.children, function (c, i) { tag(c, null, i * 90); });
    } else { tag(el, null, 0); }
  });

  // client logos wave
  document.querySelectorAll(".client-marquee, .client-grid img").forEach(function (el, i) { tag(el, i % 2 === 0 ? "l" : "r", Math.min(i * 40, 400)); });

  // force hero action buttons visible immediately (clickable from first paint)
  var ha = document.querySelector(".hero-actions");
  if (ha) { ha.classList.remove("rv", "l", "r", "in"); ha.style.animationDelay = ""; ha.style.opacity = "1"; }

  // reveal anything already in the viewport now that everything is tagged
  requestAnimationFrame(function () {
    document.querySelectorAll(".rv").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
    });
  });

  // safety net
  setTimeout(function () {
    document.querySelectorAll(".rv:not(.in)").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
    });
  }, 150);
})();