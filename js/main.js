(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll animations (AOS). If the library fails to load, drop the attributes
  // so nothing stays hidden.
  if (window.AOS) {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 60, disable: reduceMotion });
  } else {
    Array.prototype.forEach.call(document.querySelectorAll("[data-aos]"), function (el) {
      el.removeAttribute("data-aos");
    });
  }

  // Theme toggle: remembers the visitor's choice, otherwise follows the system setting.
  var themeBtn = document.querySelector(".theme-btn");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return root.getAttribute("data-theme") || (darkQuery.matches ? "dark" : "light");
  }
  function syncTheme() {
    var dark = currentTheme() === "dark";
    root.classList.toggle("is-dark", dark);
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }
  themeBtn.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncTheme();
  });
  darkQuery.addEventListener("change", syncTheme);
  syncTheme();

  // Header turns solid after the top of the hero.
  var header = document.getElementById("site-header");
  var toTop = document.querySelector(".to-top");
  var hero = document.querySelector(".hero");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    toTop.hidden = y < hero.offsetHeight;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  // Off-canvas menu on small screens.
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  var backdrop = document.querySelector(".nav-backdrop");
  var mobileQuery = window.matchMedia("(max-width: 900px)");

  function setMenu(open) {
    body.classList.toggle("nav-open", open);
    backdrop.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      var first = nav.querySelector("a");
      if (first) first.focus();
    }
  }
  menuBtn.addEventListener("click", function () {
    setMenu(!body.classList.contains("nav-open"));
  });
  backdrop.addEventListener("click", function () { setMenu(false); });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && body.classList.contains("nav-open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  mobileQuery.addEventListener("change", function (e) {
    if (!e.matches) setMenu(false);
  });

  // Highlight the nav link for the section on screen.
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) {
      var section = document.querySelector(a.getAttribute("href"));
      if (section) spy.observe(section);
    });
  }

  // Count up the highlight numbers when they come into view.
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function format(n) { return n.toLocaleString("en-US"); }
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = format(target) + suffix; return; }
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !reduceMotion) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  // Filter engagements by year.
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var events = Array.prototype.slice.call(document.querySelectorAll("#events .event"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var year = chip.getAttribute("data-year");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      events.forEach(function (ev) {
        var show = year === "all" || ev.getAttribute("data-year") === year;
        ev.hidden = !show;
        ev.classList.remove("is-entering");
        if (show && !reduceMotion) {
          void ev.offsetWidth; // restart the entry animation
          ev.classList.add("is-entering");
        }
      });
      if (window.AOS) AOS.refresh();
    });
  });

  // Quote slider: arrow buttons scroll one card at a time.
  var track = document.getElementById("quote-track");
  Array.prototype.forEach.call(document.querySelectorAll("[data-slide]"), function (btn) {
    btn.addEventListener("click", function () {
      var card = track.querySelector(".quote");
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
      var dir = btn.getAttribute("data-slide") === "next" ? 1 : -1;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      var atStart = track.scrollLeft <= 4;
      if (dir === 1 && atEnd) track.scrollTo({ left: 0 });
      else if (dir === -1 && atStart) track.scrollTo({ left: track.scrollWidth });
      else track.scrollBy({ left: dir * step });
    });
  });

  // Copy the office address.
  var copyBtn = document.querySelector(".copy-btn");
  function selectText(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var target = document.getElementById(copyBtn.getAttribute("data-copy-target"));
      var text = target.innerText.replace(/\s*\n\s*/g, ", ").trim();
      var done = function () {
        copyBtn.textContent = "Copied";
        setTimeout(function () { copyBtn.textContent = "Copy address"; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { selectText(target); });
      } else {
        selectText(target);
      }
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
