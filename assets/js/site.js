/* Shared site behaviour: navigation and the derived year figures.
   Loaded by index.html and eot-affordability-calculator.html. Everything here
   no-ops when its markup is absent, so one file can serve both pages. */
(function () {
  'use strict';

  // --- Derived years -------------------------------------------------------
  // Held in one place so the figures can never drift between pages. The HTML
  // ships the current value as a fallback for crawlers that don't run JS.
  var year = new Date().getFullYear();
  var derived = {
    'dynamic-pqe-years': year - 1997,     // post-qualification: FCMA, qualified 1997
    'dynamic-results-years': year - 2014, // Results Driven, founded 2014
    'dynamic-copyright-year': year
  };
  Object.keys(derived).forEach(function (cls) {
    document.querySelectorAll('.' + cls).forEach(function (el) {
      el.textContent = derived[cls];
    });
  });

  // --- Navigation ----------------------------------------------------------
  var nav = document.querySelector('.site-nav');
  if (!nav) return;
  var toggle = nav.querySelector('.nav-toggle');
  var links = nav.querySelector('.nav-links');
  var lastFocused = null;

  function focusable() {
    return links ? links.querySelectorAll('a[href], button:not([disabled])') : [];
  }

  function setOpen(open) {
    nav.classList.toggle('nav-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));

    // Lock the page behind the fullscreen overlay, or it scrolls underneath.
    document.body.classList.toggle('nav-is-open', open);

    if (open) {
      lastFocused = document.activeElement;

      // The overlay transitions from visibility:hidden, and focus() is a no-op on
      // an element inside a hidden subtree — so wait until the transition has
      // actually revealed it. transitionend is the signal; the timeout is the
      // fallback for when the transition is suppressed (reduced motion, or a
      // browser that skips it because the element was already visible).
      var focused = false;
      var focusFirst = function () {
        if (focused) return;
        focused = true;
        var first = focusable()[0];
        if (first) first.focus();
      };
      if (links) links.addEventListener('transitionend', focusFirst, { once: true });
      setTimeout(focusFirst, 350);
    } else {
      // Return focus to the control that opened the menu. Falling back to
      // lastFocused is no good when it was <body>, which cannot take focus.
      var back = (lastFocused && typeof lastFocused.focus === 'function' && lastFocused !== document.body)
        ? lastFocused
        : toggle;
      if (back) back.focus();
      lastFocused = null;
    }
  }

  function isOpen() {
    return nav.classList.contains('nav-open');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });
  }

  // Close once a destination is chosen.
  nav.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;

    if (e.key === 'Escape') {
      setOpen(false);
      if (toggle) toggle.focus();
      return;
    }

    // Trap Tab inside the overlay: without this, focus walks out into the page
    // behind it, which is visually hidden but still in the tab order.
    if (e.key === 'Tab') {
      var items = focusable();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // If the viewport grows back to desktop while the menu is open, drop the
  // open state — otherwise the body stays scroll-locked with no visible menu.
  var desktop = window.matchMedia('(min-width: 769px)');
  var onChange = function (e) { if (e.matches && isOpen()) setOpen(false); };
  if (desktop.addEventListener) desktop.addEventListener('change', onChange);
  else if (desktop.addListener) desktop.addListener(onChange); // Safari < 14

  // --- Scrolled state for the fixed bar ------------------------------------
  // Scroll fires far more often than the class actually changes, so coalesce
  // into one rAF and only touch the DOM on a real transition.
  var scrolled = false;
  var ticking = false;

  function update() {
    ticking = false;
    var isScrolled = window.scrollY > 50;
    if (isScrolled === scrolled) return;
    scrolled = isScrolled;
    nav.classList.toggle('nav-scrolled', isScrolled);
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  update();
})();
