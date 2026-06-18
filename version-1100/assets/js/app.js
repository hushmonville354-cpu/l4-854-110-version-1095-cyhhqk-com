(function () {
    'use strict';

    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startSlider() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                startSlider();
            });
        });

        showSlide(0);
        startSlider();
    }

    var filterPage = document.querySelector('[data-filter-page]');

    if (filterPage) {
        var input = filterPage.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function filterCards() {
            var query = input ? input.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || card.textContent.toLowerCase();
                card.classList.toggle('hidden', query && text.indexOf(query) === -1);
            });
        }

        if (input) {
            input.value = initialQuery;
            input.addEventListener('input', filterCards);
            filterCards();
        }
    }

    var playerSection = document.querySelector('[data-player-section]');

    if (playerSection) {
        var video = playerSection.querySelector('[data-player]');
        var frame = playerSection.querySelector('.video-frame');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));
        var message = playerSection.querySelector('[data-player-message]');
        var hlsInstance = null;
        var started = false;

        function setMessage(text) {
            if (!message) {
                return;
            }

            message.textContent = text;
            message.classList.toggle('show', Boolean(text));
        }

        function playVideo() {
            if (!video) {
                return;
            }

            if (started) {
                video.play().catch(function () {});
                return;
            }

            var source = video.getAttribute('data-src');

            if (!source) {
                setMessage('播放加载失败，请稍后重试。');
                return;
            }

            started = true;
            setMessage('正在加载播放源...');

            function startPlayback() {
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setMessage('点击播放器即可继续播放。');
                    });
                }
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage('');
                    startPlayback();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('播放加载失败，请稍后重试。');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    setMessage('');
                    startPlayback();
                }, { once: true });
            } else {
                video.src = source;
                setMessage('');
                startPlayback();
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', playVideo);
        });

        video.addEventListener('play', function () {
            if (frame) {
                frame.classList.add('playing');
            }
        });

        video.addEventListener('pause', function () {
            if (frame && video.currentTime === 0) {
                frame.classList.remove('playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
