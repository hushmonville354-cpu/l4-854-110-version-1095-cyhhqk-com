(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function showSlide(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });

      showSlide(0);
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll(".site-search-form")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    var filterInput = document.querySelector("[data-filter-input]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-list .movie-card"));
    var activeChip = "全部";

    function textOf(card) {
      return [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-category") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = textOf(card);
        var matchQuery = !query || haystack.indexOf(query) >= 0;
        var matchChip = activeChip === "全部" || haystack.indexOf(activeChip.toLowerCase()) >= 0;
        card.classList.toggle("is-filtered-out", !(matchQuery && matchChip));
      });
    }

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery) {
        filterInput.value = initialQuery;
      }
      filterInput.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeChip = chip.getAttribute("data-filter-chip") || "全部";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        applyFilter();
      });
    });

    if (chips.length) {
      chips[0].classList.add("active");
      applyFilter();
    }
  });
})();
