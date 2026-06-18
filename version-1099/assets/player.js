(function (global) {
    global.attachMoviePlayer = function (config) {
        const video = document.getElementById(config.videoId);
        const cover = document.getElementById(config.coverId);
        const button = document.getElementById(config.buttonId);

        if (!video || !cover || !button || !config.source) {
            return;
        }

        let started = false;
        let hls = null;

        const prepare = function () {
            if (started) {
                return;
            }

            started = true;
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = config.source;
            } else if (global.Hls && global.Hls.isSupported()) {
                hls = new global.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(config.source);
                hls.attachMedia(video);
            } else {
                video.src = config.source;
            }
        };

        const start = function () {
            prepare();
            cover.classList.add('is-hidden');
            const playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    cover.classList.remove('is-hidden');
                });
            }
        };

        button.addEventListener('click', start);
        cover.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!started) {
                start();
            }
        });

        global.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})(window);
