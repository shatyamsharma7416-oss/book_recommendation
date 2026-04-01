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
  const input    = document.getElementById('searchInput');
  const dropdown = document.getElementById('searchDropdown');
  const clearBtn = document.getElementById('searchClear');

  if (!input || !dropdown || !clearBtn) return;

  let debounceTimer = null;
  let activeIndex   = -1;
  let currentItems  = [];

  // Build absolute URL so it works on any host (localhost, Render, etc.)
  const API_BASE = window.location.origin;

  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escapeHtml(text).replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function buildItem(book, query) {
    const a = document.createElement('a');
    a.className = 'search-result-item';
    a.href = `${API_BASE}/book/${encodeURIComponent(book.title)}`;

    const thumb = document.createElement('div');
    thumb.className = 'result-thumb';
    if (book.image_url) {
      const img = document.createElement('img');
      img.src = book.image_url;
      img.alt = escapeHtml(book.title);
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

  function renderDropdown(matches, suggestions, query) {
    dropdown.innerHTML = '';
    currentItems = [];
    activeIndex = -1;

    if (!matches.length && !suggestions.length) {
      const empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = 'No books found for that title';
      dropdown.appendChild(empty);
      dropdown.classList.add('open');
      return;
    }

    if (matches.length) {
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

    if (suggestions.length) {
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

  async function fetchSuggestions(query) {
    try {
      const url = `${API_BASE}/api/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        console.warn(`Search returned ${res.status}`);
        return;
      }
      const data = await res.json();
      renderDropdown(data.matches || [], data.suggestions || [], query);
    } catch (err) {
      console.error('Search fetch error:', err);
    }
  }

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn.classList.toggle('visible', q.length > 0);
    clearTimeout(debounceTimer);
    if (q.length < 2) { closeDropdown(); return; }
    debounceTimer = setTimeout(() => fetchSuggestions(q), 220);
  });

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

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('visible');
    closeDropdown();
    input.focus();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchWrap')) closeDropdown();
  });

  input.addEventListener('focus', () => {
    const q = input.value.trim();
    if (q.length >= 2) fetchSuggestions(q);
  });

});
