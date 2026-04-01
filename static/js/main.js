// Folio — main.js

document.addEventListener('DOMContentLoaded', () => {

  // ── Page fade-in ──────────────────────────────────────────────────────────
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.35s ease';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  }));

  // ── Staggered card entrance ───────────────────────────────────────────────
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

  // ── Smooth page transition ────────────────────────────────────────────────
  document.querySelectorAll('a.book-card, a.reco-card').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.href;
      document.body.style.transition = 'opacity 0.25s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 250);
    });
  });

  // ── Search autocomplete ───────────────────────────────────────────────────
  const input     = document.getElementById('searchInput');
  const dropdown  = document.getElementById('searchDropdown');
  const clearBtn  = document.getElementById('searchClear');

  if (!input) return;

  let debounceTimer = null;
  let activeIndex   = -1;
  let currentItems  = [];

  // Highlight matching substring in title
  function highlight(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }

  // Build a single result row
  function buildItem(book, query) {
    const a = document.createElement('a');
    a.className = 'search-result-item';
    a.href = `/book/${encodeURIComponent(book.title)}`;

    const thumb = document.createElement('div');
    thumb.className = 'result-thumb';
    if (book.image_url) {
      const img = document.createElement('img');
      img.src = book.image_url;
      img.alt = book.title;
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else {
      const init = document.createElement('span');
      init.className = 'result-thumb-initial';
      init.textContent = book.title[0];
      thumb.appendChild(init);
    }

    const info = document.createElement('div');
    info.className = 'result-info';

    const titleEl = document.createElement('div');
    titleEl.className = 'result-title';
    titleEl.innerHTML = highlight(book.title, query);

    const authorEl = document.createElement('div');
    authorEl.className = 'result-author';
    authorEl.textContent = book.author;

    info.appendChild(titleEl);
    info.appendChild(authorEl);
    a.appendChild(thumb);
    a.appendChild(info);
    return a;
  }

  // Render dropdown sections
  function renderDropdown(matches, suggestions, query) {
    dropdown.innerHTML = '';
    currentItems = [];
    activeIndex = -1;

    const hasMatches = matches.length > 0;
    const hasSuggestions = suggestions.length > 0;

    if (!hasMatches && !hasSuggestions) {
      dropdown.innerHTML = '<div class="search-empty">No books found for that title</div>';
      dropdown.classList.add('open');
      return;
    }

    if (hasMatches) {
      const label = document.createElement('div');
      label.className = 'dropdown-section-label';
      label.textContent = 'Books';
      dropdown.appendChild(label);
      matches.forEach(book => {
        const item = buildItem(book, query);
        dropdown.appendChild(item);
        currentItems.push(item);
      });
    }

    if (hasSuggestions) {
      const label = document.createElement('div');
      label.className = 'dropdown-section-label';
      label.textContent = 'You might also like';
      dropdown.appendChild(label);
      suggestions.forEach(book => {
        const item = buildItem(book, '');
        dropdown.appendChild(item);
        currentItems.push(item);
      });
    }

    dropdown.classList.add('open');
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
    dropdown.innerHTML = '';
    currentItems = [];
    activeIndex = -1;
  }

  function setActive(index) {
    currentItems.forEach(el => el.classList.remove('active'));
    if (index >= 0 && index < currentItems.length) {
      currentItems[index].classList.add('active');
      currentItems[index].scrollIntoView({ block: 'nearest' });
    }
    activeIndex = index;
  }

  // Fetch from backend
  async function fetchSuggestions(query) {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = await res.json();
      renderDropdown(data.matches || [], data.suggestions || [], query);
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  // Input handler with debounce
  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn.classList.toggle('visible', q.length > 0);
    clearTimeout(debounceTimer);

    if (q.length < 2) { closeDropdown(); return; }

    debounceTimer = setTimeout(() => fetchSuggestions(q), 220);
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    if (!dropdown.classList.contains('open')) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(Math.min(activeIndex + 1, currentItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && currentItems[activeIndex]) {
        e.preventDefault();
        currentItems[activeIndex].click();
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
      input.blur();
    }
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('visible');
    closeDropdown();
    input.focus();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchWrap')) closeDropdown();
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) fetchSuggestions(input.value.trim());
  });

});
