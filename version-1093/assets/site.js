(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".search-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === active);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5000);
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q") || "";
  var searchInput = document.querySelector("[data-search-page-input]");
  if (searchInput) {
    searchInput.value = q;
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  function filterCards() {
    var keywordInput = document.querySelector("[data-filter-input]") || document.querySelector("[data-search-page-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var keyword = normalize(keywordInput ? keywordInput.value : q);
    var year = yearSelect ? yearSelect.value : "";
    var type = typeSelect ? typeSelect.value : "";

    document.querySelectorAll("[data-card]").forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var cardYear = card.getAttribute("data-year") || "";
      var cardType = card.getAttribute("data-type") || "";
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }
      if (year && cardYear !== year) {
        matched = false;
      }
      if (type && cardType !== type) {
        matched = false;
      }

      card.classList.toggle("hidden-card", !matched);
    });
  }

  document.querySelectorAll("[data-filter-input], [data-filter-year], [data-filter-type], [data-search-page-input]").forEach(function (control) {
    control.addEventListener("input", filterCards);
    control.addEventListener("change", filterCards);
  });

  if (document.querySelector("[data-card]")) {
    filterCards();
  }
})();

function initMoviePlayer(src) {
  function bind() {
    var video = document.getElementById("movie-video");
    var overlay = document.querySelector(".player-overlay");
    var starters = document.querySelectorAll("[data-player-start]");
    var ready = false;
    var hls = null;

    if (!video) {
      return;
    }

    function attachSource() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function startPlayback() {
      attachSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(function () {});
      }
    }

    starters.forEach(function (starter) {
      starter.addEventListener("click", startPlayback);
    });

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
}
