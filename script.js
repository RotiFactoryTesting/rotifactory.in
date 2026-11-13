// mobile menu
(function () {
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
