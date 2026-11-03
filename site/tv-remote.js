/* MsM.Tv Android TV remote support: D-pad, OK/Enter and Back */
(function () {
  'use strict';
  var SELECTOR = '#cats button, #grid .card, #closePlayer, #prevChannel, #nextChannel, #vipMute, #vipFullscreen, #installAppBtn';
  var observer;

  function isVisible(el) {
    if (!el || el.disabled === true) return false;
    var s = window.getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && el.getClientRects().length > 0;
  }
  function refreshFocusable() {
    document.querySelectorAll(SELECTOR).forEach(function (el) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('data-tv-focus-ready')) el.setAttribute('data-tv-focus-ready', '1');
    });
  }
  function items() {
    refreshFocusable();
    return Array.prototype.slice.call(document.querySelectorAll(SELECTOR)).filter(isVisible);
  }
  function focusFirst() {
    var list = items();
    if (!list.length) return;
    var activeCat = document.querySelector('#cats button.active');
    (isVisible(activeCat) ? activeCat : list[0]).focus();
  }
  function moveFocus(direction) {
    var list = items();
    if (!list.length) return;
    var current = document.activeElement;
    if (list.indexOf(current) < 0) {
      focusFirst();
      return;
    }
    var a = current.getBoundingClientRect();
    var ax = a.left + a.width / 2;
    var ay = a.top + a.height / 2;
    var best = null, bestScore = Infinity;
    list.forEach(function (el) {
      if (el === current) return;
      var r = el.getBoundingClientRect();
      var dx = (r.left + r.width / 2) - ax;
      var dy = (r.top + r.height / 2) - ay;
      var primary, secondary;
      if (direction === 'right') { if (dx <= 2) return; primary = dx; secondary = Math.abs(dy); }
      if (direction === 'left')  { if (dx >= -2) return; primary = -dx; secondary = Math.abs(dy); }
      if (direction === 'down')  { if (dy <= 2) return; primary = dy; secondary = Math.abs(dx); }
      if (direction === 'up')    { if (dy >= -2) return; primary = -dy; secondary = Math.abs(dx); }
      var score = primary + secondary * 2.2;
      if (score < bestScore) { bestScore = score; best = el; }
    });
    if (!best) {
      var i = list.indexOf(current);
      var step = (direction === 'left' || direction === 'up') ? -1 : 1;
      best = list[Math.max(0, Math.min(list.length - 1, i + step))];
    }
    if (best && best !== current) {
      best.focus();
      best.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }
  function closePlayerIfOpen() {
    var section = document.getElementById('playerSection');
    if (!section || section.hidden || window.getComputedStyle(section).display === 'none') return false;
    var close = document.getElementById('closePlayer');
    if (close && isVisible(close)) close.click();
    else section.hidden = true;
    return true;
  }

  document.addEventListener('keydown', function (e) {
    var key = e.key;
    var code = e.keyCode || e.which;

    // Android TV Back/Escape
    if (key === 'Escape' || key === 'Backspace' || code === 4 || code === 27) {
      if (closePlayerIfOpen()) { e.preventDefault(); e.stopPropagation(); }
      return;
    }

    // D-pad arrows (standard Android keycodes 19-22)
    var dirs = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      19: 'up', 20: 'down', 21: 'left', 22: 'right'
    };
    var direction = dirs[key] || dirs[String(code)];
    if (direction) {
      if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) return;
      e.preventDefault();
      moveFocus(direction);
      return;
    }

    // OK / Enter / center button (Android keycodes 23 and 66)
    if (key === 'Enter' || key === ' ' || code === 23 || code === 66 || code === KeyEventCenter()) {
      var target = document.activeElement;
      if (target && target !== document.body && target !== document.documentElement) {
        if (target.matches(SELECTOR)) {
          e.preventDefault();
          target.click();
        }
      } else {
        focusFirst();
        e.preventDefault();
      }
    }
  }, true);

  function KeyEventCenter() { return 23; }
  if (window.MutationObserver) {
    observer = new MutationObserver(refreshFocusable);
    window.addEventListener('DOMContentLoaded', function () {
      refreshFocusable();
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(focusFirst, 500);
    }, { once: true });
  } else {
    window.addEventListener('load', function () { refreshFocusable(); setTimeout(focusFirst, 500); }, { once: true });
  }
})();
