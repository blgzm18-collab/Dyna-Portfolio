// Smooth-scroll for any element with data-scroll="<section id>"
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-scroll]');
  if (!el) return;
  var target = document.getElementById(el.getAttribute('data-scroll'));
  if (target) target.scrollIntoView({ behavior: 'smooth' });
});