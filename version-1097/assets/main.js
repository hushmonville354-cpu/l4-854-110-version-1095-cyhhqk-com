(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.slider-dots button'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === active);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === active);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var regionSelects = Array.prototype.slice.call(document.querySelectorAll('[data-region-filter]'));
  var yearSelects = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
  var categorySelects = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var empty = document.querySelector('.empty-message');

  function currentValue(list) {
    var item = list.find(function (node) {
      return node.offsetParent !== null || node.value;
    });
    return item ? item.value.trim().toLowerCase() : '';
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = currentValue(searchInputs);
    var region = currentValue(regionSelects);
    var year = currentValue(yearSelects);
    var category = currentValue(categorySelects);
    var visible = 0;

    cards.forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var genre = (card.getAttribute('data-genre') || '').toLowerCase();
      var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
      var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
      var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
      var matched = true;

      if (query && title.indexOf(query) === -1 && genre.indexOf(query) === -1 && cardRegion.indexOf(query) === -1) {
        matched = false;
      }
      if (region && cardRegion !== region) {
        matched = false;
      }
      if (year && cardYear !== year) {
        matched = false;
      }
      if (category && cardCategory !== category) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  searchInputs.concat(regionSelects, yearSelects, categorySelects).forEach(function (node) {
    node.addEventListener('input', filterCards);
    node.addEventListener('change', filterCards);
  });
})();
