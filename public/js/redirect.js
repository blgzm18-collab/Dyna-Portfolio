// Reads the destination from the fallback link so the URL lives in one place (index.html)
(function () {
  var link = document.getElementById('go');
  if (link && link.href) window.location.replace(link.href);
})();