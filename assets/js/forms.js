/* Forms never fail silently.
   - No endpoint configured: the page renders the form disabled with a visible banner (done at build time).
   - Endpoint configured: we POST, and only show success on a real 2xx response.
   - Any failure keeps the visitor's input on screen and shows the fallback contact. */
(function () {
  function qs(s, r) { return (r || document).querySelector(s); }
  function show(el, on) { if (el) el.hidden = !on; }

  function wire(form) {
    var endpoint = form.getAttribute("data-endpoint");
    if (!endpoint) return; // disabled at build time
    var ok = qs("[data-status=ok]", form.parentNode);
    var bad = qs("[data-status=error]", form.parentNode);
    var btn = qs("button[type=submit]", form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      show(ok, false); show(bad, false);
      if (qs(".hp input", form) && qs(".hp input", form).value) return; // bot
      if (!form.reportValidity()) return;
      if (form.id === "lead-form") {
        var est = document.querySelector("[data-est-text]");
        var f = qs("[name=estimate]", form);
        if (f && est) f.value = est.textContent.trim();
      }
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending…";
      var body = new FormData(form);
      body.append("page", location.pathname);
      body.append("sent_at", new Date().toISOString());
      fetch(endpoint, { method: "POST", body: body, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          form.reset(); show(form, false); show(ok, true);
          if (ok) ok.focus();
        })
        .catch(function () {
          show(bad, true);
          if (bad) bad.focus();
        })
        .finally(function () { btn.disabled = false; btn.textContent = label; });
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll("form[data-form]"), wire);
})();
