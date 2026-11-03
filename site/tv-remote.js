/* MsM.Tv Android TV / D-pad compatibility */
(function () {
  "use strict";
  var selector = '#cats button, #grid .card, #closePlayer, #prevChannel, #nextChannel, #vipMute, #vipFullscreen';
  function visible(el) {
    return !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  }
  function focusables() {
    return Array.prototype.slice.call(document.querySelectorAll(selector)).filter(visible);
  }
  document.addEventListener('keydown', function (event) {
    var key = event.key;
    var code = event.keyCode;
    if (key === 'Backspace' || key === 'Escape' || code === 4 || code === backCode()) {
      var player = document.getElementById('playerSection');
      if (player && !player.hidden && getComputedStyle(player).display !== 'none') {
        event.preventDefault();
        var close = document.getElementById('closePlayer');
        if (close) close.click();
      }
      return;
    }
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key) &&
        ![19,20,21,22].includes(code)) return;
    if (event.target && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    var items = focusables();
    if (!items.length) return;
    var active = document.activeElement;
    var index = items.indexOf(active);
    if (index < 0) index = 0;
    var target = null;
    if (key === 'ArrowRight' || code === 22) target = items[Math.min(index + 1, items.length - 1)];
    if (key === 'ArrowLeft' || code === 21) target = items[Math.max(index - 1, 0)];
    if (key === 'ArrowDown' || code === 20) {
      var rect = items[index].getBoundingClientRect();
      var candidates = items.filter(function (el) {
        var r = el.getBoundingClientRect();
        return r.top > rect.top + 4;
      }).sort(function (a,b) {
        var ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
        return (ar.top-br.top) || Math.abs(ar.left-rect.left)-Math.abs(br.left-rect.left);
      });
      target = candidates[0] || items[Math.min(index + 1, items.length - 1)];
    }
    if (key === 'ArrowUp' || code === 19) {
      var rect2 = items[index].getBoundingClientRect();
      var candidates2 = items.filter(function (el) {
        var r = el.getBoundingClientRect();
        return r.bottom < rect2.bottom - 4;
      }).sort(function (a,b) {
        var ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
        return (br.bottom-ar.bottom) || Math.abs(ar.left-rect2.left)-Math.abs(br.left-rect2.left);
      });
      target = candidates2[0] || items[Math.max(index - 1, 0)];
    }
    if (target) {
      event.preventDefault();
      target.focus();
      target.scrollIntoView({block:'nearest', inline:'nearest'});
    }
  }, true);
  function backCode(){ return 27; }
})();
