// Folio — main.js

document.addEventListener('DOMContentLoaded', () => {
  // Staggered book card entrance using IntersectionObserver
  const cards = document.querySelectorAll('.book-card, .reco-card');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    cards.forEach(card => {
      card.style.animationPlayState = 'paused';
      observer.observe(card);
    });
  }

  // Smooth page transition on card click
  document.querySelectorAll('a.book-card, a.reco-card').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.href;
      document.body.style.transition = 'opacity 0.25s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 250);
    });
  });

  // Fade in on load
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.35s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
});
