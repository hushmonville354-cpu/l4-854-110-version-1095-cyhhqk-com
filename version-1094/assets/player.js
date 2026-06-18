(function () {
  window.initializeMoviePlayer = function (streamUrl) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var trigger = shell.querySelector("[data-play]");
    var started = false;
    var hls = null;

    function hideTrigger() {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    }

    function playVideo() {
      hideTrigger();
      video.setAttribute("controls", "controls");
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }

    function attachStream() {
      if (started) {
        playVideo();
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            }
          }
        });
        return;
      }

      video.src = streamUrl;
      playVideo();
    }

    if (trigger) {
      trigger.addEventListener("click", attachStream);
    }

    video.addEventListener("click", function () {
      if (!started) {
        attachStream();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
