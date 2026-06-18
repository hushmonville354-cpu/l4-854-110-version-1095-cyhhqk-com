(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  var hero = document.querySelector(".hero-carousel");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  function applyFilters(targetSelector) {
    var scope = document.querySelector(targetSelector);
    if (!scope) {
      return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-target="' + targetSelector + '"].movie-search'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-target="' + targetSelector + '"].movie-filter'));
    var empty = document.querySelector('[data-empty-for="' + targetSelector + '"]');

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function refresh() {
      var keyword = normalize(searchInputs.map(function (input) {
        return input.value;
      }).join(" "));
      var activeFilters = filters.map(function (filter) {
        return {
          key: filter.getAttribute("data-filter-key"),
          value: normalize(filter.value)
        };
      }).filter(function (item) {
        return item.key && item.value;
      });
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        var filterMatched = activeFilters.every(function (item) {
          return normalize(card.getAttribute("data-" + item.key)).indexOf(item.value) !== -1;
        });
        var isVisible = keywordMatched && filterMatched;
        card.classList.toggle("is-hidden-card", !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visibleCount === 0);
      }
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", refresh);
    });
    filters.forEach(function (filter) {
      filter.addEventListener("change", refresh);
    });
    refresh();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (node) {
    applyFilters(node.getAttribute("data-filter-scope"));
  });
})();

function setupVideoPlayer(videoId, coverId, sourceUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var loaded = false;
  var hls = null;

  if (!video) {
    return;
  }

  function startPlayback() {
    if (!loaded) {
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (!loaded) {
      startPlayback();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
