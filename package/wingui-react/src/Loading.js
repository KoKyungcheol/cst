function setLoadingBar(show) {
  let target = document.getElementById('content-loading-bar');
  let display = show ? "flex" : "none";

  if (target) {
    target.style.setProperty("display", display, "important");
  }
}

export { setLoadingBar };
