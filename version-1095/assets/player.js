function initPlayer(streamUrl) {
  var box = document.querySelector(".movie-player");
  if (!box) {
    return;
  }
  var video = box.querySelector("video");
  var cover = box.querySelector(".player-cover");
  var loaded = false;

  function playVideo() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function load() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
    if (loaded) {
      playVideo();
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.load();
      return;
    }
    if (window.Hls && Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
      box.hls = hls;
      return;
    }
    video.src = streamUrl;
    video.addEventListener("loadedmetadata", playVideo, { once: true });
    video.load();
  }

  if (cover) {
    cover.addEventListener("click", load);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      load();
    }
  });
}
