(function () {
  "use strict";

  // Inserire qui l'indirizzo definitivo quando sara disponibile.
  const CONTACT_EMAIL = "";

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  const backToTop = document.querySelector(".back-to-top");
  const form = document.querySelector("#contact-form");

  function closeMenu() {
    nav.classList.remove("open");
    menuButton.classList.remove("active");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Apri menu");
    document.body.classList.remove("menu-open");
  }

  menuButton.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("open");
    menuButton.classList.toggle("active", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Chiudi menu" : "Apri menu");
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  function handleScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 15);
    backToTop.classList.toggle("visible", y > 500);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const sections = document.querySelectorAll("main section[id], header[id]");
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-35% 0px -55%", threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });

    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll(".reveal").forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (element) {
      element.classList.add("visible");
    });
  }

  const rules = {
    name: function (value) { return value.trim().length >= 2; },
    email: function (value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); },
    "request-type": function (value) { return value !== ""; },
    message: function (value) { return value.trim().length >= 10; },
    privacy: function (_, field) { return field.checked; }
  };

  const messages = {
    name: "Inserisci il tuo nome.",
    email: "Inserisci un indirizzo email valido.",
    "request-type": "Seleziona il tipo di richiesta.",
    message: "Descrivi la richiesta con almeno 10 caratteri.",
    privacy: "\u00c8 necessario accettare l'informativa privacy."
  };

  function validateField(field) {
    const validator = rules[field.name];
    if (!validator) return true;
    const isValid = validator(field.value, field);
    const wrapper = field.closest(".field");
    const error = wrapper.querySelector(".error-message");
    wrapper.classList.toggle("invalid", !isValid);
    field.setAttribute("aria-invalid", String(!isValid));
    error.textContent = isValid ? "" : messages[field.name];
    return isValid;
  }

  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    const eventName = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "blur";
    field.addEventListener(eventName, function () { validateField(field); });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const requiredFields = Array.from(form.querySelectorAll("[required]"));
    const isValid = requiredFields.map(validateField).every(Boolean);
    const success = form.querySelector(".form-success");

    if (!isValid) {
      success.textContent = "";
      const firstInvalid = form.querySelector(".invalid input, .invalid select, .invalid textarea");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (!CONTACT_EMAIL) {
      success.textContent = "Richiesta pronta. Il contatto email sar\u00e0 disponibile a breve.";
      return;
    }

    const data = new FormData(form);
    const subject = "Richiesta dal sito - " + data.get("request-type");
    const body = [
      "Nome: " + data.get("name"),
      "Azienda: " + (data.get("company") || "Non indicata"),
      "Email: " + data.get("email"),
      "Tipo di richiesta: " + data.get("request-type"),
      "",
      "Messaggio:",
      data.get("message")
    ].join("\n");

    window.location.href = "mailto:" + CONTACT_EMAIL
      + "?subject=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(body);
  });

  document.querySelector("#year").textContent = new Date().getFullYear();
})();
