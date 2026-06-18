(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMobileMenu() {
    var toggle = one('.mobile-toggle');
    var panel = one('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = one('.hero');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var dots = all('.hero-dot', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-category') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-genre') || ''
    ].join(' ').toLowerCase();
  }

  function initCatalog() {
    var input = one('#catalogSearch');
    var cards = all('.movie-card');
    var buttons = all('.filter-btn');
    if (!cards.length) {
      return;
    }
    var active = 'all';

    function run() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = cardText(card);
        var filterMatch = active === 'all' || text.indexOf(active.toLowerCase()) !== -1;
        var queryMatch = !query || text.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !(filterMatch && queryMatch));
      });
    }

    if (input) {
      input.addEventListener('input', run);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        run();
      });
    });

    run();
  }

  function initSearchForms() {
    all('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = one('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        var catalogInput = one('#catalogSearch');
        if (catalogInput) {
          catalogInput.value = value;
          catalogInput.dispatchEvent(new Event('input'));
          var target = one('#catalog');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (value) {
          window.location.href = 'index.html?q=' + encodeURIComponent(value) + '#catalog';
        } else {
          window.location.href = 'index.html#catalog';
        }
      });
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = one('#movieVideo');
    var button = one('#startPlay');
    var frame = one('#playerBox');
    var hlsPlayer = null;
    if (!video || !streamUrl) {
      return;
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function attachAndPlay() {
      hideButton();
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.getAttribute('src') !== streamUrl) {
          video.setAttribute('src', streamUrl);
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsPlayer) {
          hlsPlayer = new window.Hls({ enableWorker: true });
          hlsPlayer.loadSource(streamUrl);
          hlsPlayer.attachMedia(video);
          hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      if (video.getAttribute('src') !== streamUrl) {
        video.setAttribute('src', streamUrl);
      }
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        attachAndPlay();
      });
    }

    if (frame) {
      frame.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        attachAndPlay();
      });
    }

    video.addEventListener('play', hideButton);
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initCatalog();
    initSearchForms();
  });
})();
