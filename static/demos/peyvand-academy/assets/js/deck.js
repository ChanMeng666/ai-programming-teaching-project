/* ============================================================
   Deck navigation: arrows / space / Home / End, progress bar,
   slide counter, deep-link via hash, and an N speaker-notes panel.
   ============================================================ */
(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var progress = document.getElementById("progress");
  var counter = document.getElementById("counter");
  var notes = document.getElementById("notes");
  var notesBody = document.getElementById("notesBody");
  var notesTime = document.getElementById("notesTime");
  var total = slides.length;
  var current = 0;

  function clamp(n) {
    return Math.max(0, Math.min(total - 1, n));
  }

  function syncNotes() {
    var src = slides[current].querySelector(".slide-notes");
    notesBody.textContent = src ? src.textContent.trim() : "";
    notesTime.textContent = src ? src.getAttribute("data-time") || "" : "";
  }

  function render() {
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    progress.style.width = ((current + 1) / total) * 100 + "%";
    counter.textContent = String(current + 1);
    syncNotes();
    if (location.hash !== "#" + (current + 1)) {
      history.replaceState(null, "", "#" + (current + 1));
    }
  }

  function go(n) {
    current = clamp(n);
    render();
  }

  function next() {
    go(current + 1);
  }

  function prev() {
    go(current - 1);
  }

  document.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
      case "Spacebar":
        e.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        prev();
        break;
      case "Home":
        e.preventDefault();
        go(0);
        break;
      case "End":
        e.preventDefault();
        go(total - 1);
        break;
      case "n":
      case "N":
        notes.classList.toggle("is-open");
        break;
      case "Escape":
        notes.classList.remove("is-open");
        break;
      default:
        break;
    }
  });

  document.getElementById("next").addEventListener("click", next);
  document.getElementById("prev").addEventListener("click", prev);

  window.addEventListener("hashchange", function () {
    var n = parseInt(location.hash.replace("#", ""), 10);
    if (!isNaN(n) && n - 1 !== current) {
      go(n - 1);
    }
  });

  // Start from a deep link if present (e.g. index.html#3)
  var startHash = parseInt(location.hash.replace("#", ""), 10);
  if (!isNaN(startHash)) {
    current = clamp(startHash - 1);
  }

  render();
})();
