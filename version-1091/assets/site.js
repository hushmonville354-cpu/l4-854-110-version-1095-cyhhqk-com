(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobile = document.querySelector("[data-mobile-nav]");

  if (toggle && mobile) {
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var list = panel.parentElement.querySelector("[data-card-list]");
    if (!list) {
      return;
    }

    var input = panel.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var empty = panel.parentElement.querySelector("[data-empty-state]");
    var filters = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));

    filters.forEach(function (select) {
      var key = select.getAttribute("data-filter");
      var values = [];
      cards.forEach(function (card) {
        var value = card.getAttribute("data-" + key);
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort(function (a, b) {
        return b.localeCompare(a, "zh-Hans-CN", { numeric: true });
      });
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });

    function run() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var shown = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        var ok = !q || text.indexOf(q) !== -1;
        filters.forEach(function (select) {
          var key = select.getAttribute("data-filter");
          if (select.value && card.getAttribute("data-" + key) !== select.value) {
            ok = false;
          }
        });

        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", run);
    }
    filters.forEach(function (select) {
      select.addEventListener("change", run);
    });
  });

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(pos) {
      index = (pos + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    if (slides.length > 1) {
      play();
    }
  });
}());
