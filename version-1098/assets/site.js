(function () {
  "use strict";

  var currentScript = document.currentScript;
  var assetBase = "./assets/";

  if (currentScript && currentScript.src) {
    assetBase = currentScript.src.slice(0, currentScript.src.lastIndexOf("/") + 1);
  }

  var hlsPromise = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .trim();
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
        dot.setAttribute("aria-selected", dotIndex === activeIndex ? "true" : "false");
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 6200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);

    showSlide(0);
    startTimer();
  }

  function setupGlobalSearchForms() {
    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var url = "movies.html";

        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }

        window.location.href = url;
      });
    });
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-movie-grid]");

    if (!panel || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var input = panel.querySelector("[data-search-input]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var resultCount = document.querySelector("[data-results-count]");
    var emptyMessage = document.querySelector("[data-empty-message]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function matches(card) {
      var query = input ? normalize(input.value) : "";
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.category
      ].join(" "));

      if (query && haystack.indexOf(query) === -1) {
        return false;
      }

      if (typeSelect && typeSelect.value && card.dataset.typeGroup !== typeSelect.value) {
        return false;
      }

      if (yearSelect && yearSelect.value && card.dataset.year !== yearSelect.value) {
        return false;
      }

      if (categorySelect && categorySelect.value && card.dataset.categorySlug !== categorySelect.value) {
        return false;
      }

      if (regionSelect && regionSelect.value && card.dataset.region !== regionSelect.value) {
        return false;
      }

      return true;
    }

    function applyFilters() {
      var visible = 0;

      cards.forEach(function (card) {
        var isVisible = matches(card);
        card.classList.toggle("is-hidden", !isVisible);

        if (isVisible) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = "当前显示 " + visible + " 部影片 / 共 " + cards.length + " 部";
      }

      if (emptyMessage) {
        emptyMessage.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, typeSelect, yearSelect, categorySelect, regionSelect].forEach(function (control) {
      if (!control) {
        return;
      }

      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    });

    applyFilters();
  }

  function setupImageFallbacks() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        var wrapper = image.closest(".poster, .hero-poster, .detail-cover, .thumb-cell, .rank-cover");

        if (!wrapper || wrapper.classList.contains("is-missing")) {
          return;
        }

        wrapper.classList.add("is-missing");
        wrapper.setAttribute("data-fallback-title", image.getAttribute("alt") || "封面图");
        image.removeAttribute("src");
      });
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");

      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = import(assetBase + "video-vendor-dru42stk.js")
        .then(function (module) {
          return module.H || module.Hls || module.default || null;
        })
        .catch(function () {
          return loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js")
            .then(function () {
              return window.Hls || null;
            })
            .catch(function () {
              return null;
            });
        });
    }

    return hlsPromise;
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var message = player.querySelector("[data-player-message]");
      var started = false;

      if (!video || !button) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function playVideo() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setMessage("浏览器阻止了自动播放，请再次点击播放器上的播放按钮。");
          });
        }
      }

      function start() {
        var source = video.dataset.videoSrc;

        if (started) {
          playVideo();
          return;
        }

        if (!source) {
          setMessage("当前影片暂未配置播放源。");
          return;
        }

        started = true;
        button.disabled = true;
        setMessage("正在初始化 HLS 播放器，请稍候。");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          button.classList.add("is-hidden");
          setMessage("播放源已加载。");
          return;
        }

        loadHls().then(function (Hls) {
          if (Hls && Hls.isSupported && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });

            player._hls = hls;
            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              button.classList.add("is-hidden");
              setMessage("播放源已加载。");
              playVideo();
            });

            hls.on(Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }

              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setMessage("网络加载异常，正在尝试恢复播放。");
                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                setMessage("媒体解码异常，正在尝试恢复播放。");
                hls.recoverMediaError();
              } else {
                setMessage("播放源暂时无法加载，请稍后再试。");
                hls.destroy();
                started = false;
                button.disabled = false;
                button.classList.remove("is-hidden");
              }
            });
          } else {
            started = false;
            button.disabled = false;
            setMessage("当前浏览器不支持 HLS 播放，请更换浏览器或使用 Safari 访问。");
          }
        });
      }

      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
    });
  }

  ready(function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupGlobalSearchForms();
    setupFilters();
    setupImageFallbacks();
    setupPlayers();
  });
})();
