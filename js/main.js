(function () {
  "use strict";

  var root = document.documentElement;

  // Theme toggle: remembers the visitor's choice, otherwise follows the system setting.
  var themeBtn = document.querySelector(".theme-btn");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return root.getAttribute("data-theme") || (darkQuery.matches ? "dark" : "light");
  }

  function syncThemeButton() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    themeBtn.textContent = next === "dark" ? "Dark" : "Light";
    themeBtn.setAttribute("aria-label", "Switch to " + next + " theme");
  }

  themeBtn.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncThemeButton();
  });
  darkQuery.addEventListener("change", syncThemeButton);
  syncThemeButton();

  // Mobile menu
  var menuBtn = document.querySelector(".menu-btn");
  var navList = document.getElementById("nav-links");

  function setMenu(open) {
    navList.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
  }

  menuBtn.addEventListener("click", function () {
    setMenu(!navList.classList.contains("is-open"));
  });
  navList.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navList.classList.contains("is-open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  // Highlight the nav link for the section currently on screen.
  var navLinks = Array.prototype.slice.call(navList.querySelectorAll("a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { observer.observe(s); });
  }

  // Filter engagements by year.
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var engagements = Array.prototype.slice.call(document.querySelectorAll("#engagement-list li"));

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var year = chip.getAttribute("data-year");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      var first = true;
      engagements.forEach(function (li) {
        var show = year === "all" || li.getAttribute("data-year") === year;
        li.hidden = !show;
        li.classList.toggle("is-first", show && first);
        if (show) first = false;
      });
    });
  });

  // Copy the office address.
  var copyBtn = document.querySelector(".copy-btn");
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

  function selectText(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // Back-to-top button appears after the hero.
  var toTop = document.querySelector(".to-top");
  var hero = document.querySelector(".hero");
  function onScroll() {
    toTop.hidden = window.scrollY < hero.offsetHeight;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0 });
    document.querySelector(".brand").focus();
  });
  onScroll();

  document.getElementById("year").textContent = new Date().getFullYear();
})();
