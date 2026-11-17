(function () {
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
  }

  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.elements["email"].value.trim();
    var phone = form.elements["phone"].value.trim();
    if (!email || !phone) {
      status.className = "err";
      status.textContent = "Please fill in your email and phone number.";
      return;
    }
    var b = form.querySelector("button[type=submit]");
    b.disabled = true;
    status.className = "";
    status.textContent = "Sending...";
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.success) throw new Error(d.message || "failed");
        status.className = "ok";
        status.textContent = "Thank you. We have your enquiry and will get back to you shortly.";
        form.reset();
      })
      .catch(function () {
        status.className = "err";
        status.textContent = "Could not send right now. Please call 93112 48330 or message us on WhatsApp.";
      })
      .finally(function () { b.disabled = false; });
  });
})();
