// mobile menu
(function () {
  document.documentElement.classList.add("js"); // enables entrance animations (CSS keys off this)
  var btn = document.querySelector(".menu-btn");
  var nav = document.querySelector("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();

// contact form (Web3Forms -> delivers to the inbox the access key was created for)
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var key = form.querySelector('[name="access_key"]').value;
    if (!key || key.indexOf("PASTE_") === 0) {
      status.className = "err";
      status.textContent = "Form is not activated yet. Please call or WhatsApp us for now.";
      return;
    }
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.className = "";
    status.textContent = "Sending...";
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.success) {
          status.className = "ok";
          status.textContent = "Thank you! We have received your message and will get back to you soon.";
          form.reset();
        } else {
          throw new Error(d.message || "Failed");
        }
      })
      .catch(function () {
        status.className = "err";
        status.textContent = "Could not send right now. Please call us or message on WhatsApp.";
      })
      .finally(function () { btn.disabled = false; });
  });
})();

// entrance animations (lightweight: only opacity/transform; GPU-accelerated, no libraries)
(function () {
  var html = document.documentElement;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) { html.classList.remove("js"); return; }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  function tag(el, dir, delay) {
    if (!el || el.classList.contains("rv")) return;
    el.classList.add("rv");
    if (dir) el.classList.add(dir);
    if (delay) el.style.animationDelay = delay + "ms";
    io.observe(el);
  }

  // hero: slides in from left / right on page load
  var heroEls = document.querySelectorAll(".hero .wrap > *");
  heroEls.forEach(function (el, i) { tag(el, i % 2 === 0 ? "l" : "r", i * 160); });

  // sections: fade-up headings, alternating sides + stagger for cards/photos
  document.querySelectorAll("main section .wrap > *").forEach(function (el) {
    if (el.classList.contains("grid") || el.classList.contains("clients")) {
      Array.prototype.forEach.call(el.children, function (child, i) {
        tag(child, i % 2 === 0 ? "l" : "r", Math.min(i * 110, 440));
      });
    } else if (el.classList.contains("split")) {
      tag(el.children[0], "l", 0);
      tag(el.children[1], "r", 140);
    } else if (el.classList.contains("block")) {
      Array.prototype.forEach.call(el.children, function (child) {
        if (child.classList.contains("split")) {
          tag(child.children[0], "l", 0);
          tag(child.children[1], "r", 140);
        } else { tag(child, null, 0); }
      });
    } else if (!el.classList.contains("toc")) {
      tag(el, null, 0);
    }
  });

  // client logos: quick alternating wave
  document.querySelectorAll(".clients img").forEach(function (el, i) {
    tag(el, i % 2 === 0 ? "l" : "r", Math.min(i * 45, 450));
  });

  // safety net: reveal anything in the viewport that the observer missed (odd browsers, throttled tabs)
  setTimeout(function () {
    document.querySelectorAll(".rv:not(.in)").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
    });
  }, 1500);
})();
