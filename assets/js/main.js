// Minimal progressive enhancement: everything remains readable without JavaScript.
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
const filters = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];
filters.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  filters.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  cards.forEach(card => { card.hidden = selected !== 'all' && card.dataset.category !== selected; });
}));


// The trigger is deliberately a button (not an external link), preventing Safari
// from navigating to GitHub if its native <dialog> support differs.
// The current public README is fetched whenever the overlay opens.
const statementTrigger = document.getElementById('personal-statement-trigger');
const statementOverlay = document.getElementById('personal-statement-overlay');
const statementDialog = document.getElementById('personal-statement-dialog');
const statementClose = document.getElementById('personal-statement-close');
const statementContent = document.getElementById('statement-content');
const statementStatus = document.getElementById('statement-load-status');
const statementSource = 'https://raw.githubusercontent.com/KaiPlunkett/personal-statement/main/README.md';

// Create Markdown elements using textContent (not innerHTML) to safely render
// content from the repository without running any HTML or scripts from it.
function renderStatementMarkdown(markdown) {
  statementContent.replaceChildren();
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let paragraph = [];
  let currentList = null;

  function appendInline(container, text) {
    // Basic emphasis and Markdown links; unsupported syntax remains plain text.
    const tokens = /(\[([^\]]+)\]\((https:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
    let from = 0;
    let match;
    while ((match = tokens.exec(text)) !== null) {
      if (match.index > from) container.append(document.createTextNode(text.slice(from, match.index)));
      if (match[2] && match[3]) {
        const a = document.createElement('a');
        a.textContent = match[2];
        a.href = match[3];
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        container.append(a);
      } else if (match[4]) {
        const strong = document.createElement('strong');
        strong.textContent = match[4];
        container.append(strong);
      } else {
        const em = document.createElement('em');
        em.textContent = match[5];
        container.append(em);
      }
      from = tokens.lastIndex;
    }
    if (from < text.length) container.append(document.createTextNode(text.slice(from)));
  }

  function flushParagraph() {
    if (!paragraph.length) return;
    const p = document.createElement('p');
    appendInline(p, paragraph.join('\n'));
    statementContent.append(p);
    paragraph = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      currentList = null;
      continue;
    }
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      currentList = null;
      // Omit the README's repeated top-level "Personal Statement" heading:
      // the modal already provides that title.
      if (heading[1].length === 1 && heading[2].trim().toLowerCase() === 'personal statement') continue;
      const h = document.createElement(heading[1].length < 3 ? 'h2' : heading[1].length === 3 ? 'h3' : 'h4');
      appendInline(h, heading[2]);
      statementContent.append(h);
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph(); currentList = null;
      statementContent.append(document.createElement('hr'));
      continue;
    }
    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const tag = unordered ? 'ul' : 'ol';
      if (!currentList || currentList.tagName.toLowerCase() !== tag) {
        currentList = document.createElement(tag);
        statementContent.append(currentList);
      }
      const li = document.createElement('li');
      appendInline(li, (unordered || ordered)[1]);
      currentList.append(li);
      continue;
    }
    currentList = null;
    paragraph.push(trimmed);
  }
  flushParagraph();
}

// Custom modal avoids relying on Safari's native HTMLDialogElement.showModal().
// Keeping focus inside the modal makes this usable with a keyboard as well.
if (statementTrigger && statementOverlay && statementDialog && statementClose && statementContent && statementStatus) {
  let lastFocusedElement = null;
  let currentRequest = null;

  function closeStatement() {
    if (statementOverlay.hidden) return;
    statementOverlay.hidden = true;
    document.body.classList.remove('statement-is-open');
    if (currentRequest) {
      currentRequest.abort();
      currentRequest = null;
    }
    if (lastFocusedElement && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus();
    } else {
      statementTrigger.focus();
    }
  }

  async function fetchStatement(signal) {
    // GitHub raw content supports CORS. Try the API if it is blocked or fails.
    try {
      const response = await fetch(statementSource, { cache: 'no-store', signal });
      if (!response.ok) throw new Error(`Raw GitHub returned HTTP ${response.status}`);
      const markdown = await response.text();
      if (!markdown.trim()) throw new Error('The README is empty');
      return markdown;
    } catch (rawError) {
      if (signal.aborted) throw rawError;
      const apiUrl = 'https://api.github.com/repos/KaiPlunkett/personal-statement/contents/README.md';
      const response = await fetch(apiUrl, { cache: 'no-store', signal, headers: { Accept: 'application/vnd.github+json' } });
      if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}`);
      const file = await response.json();
      if (!file.content || file.encoding !== 'base64') throw new Error('Unexpected README response');
      const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, '')), character => character.charCodeAt(0));
      const markdown = new TextDecoder('utf-8').decode(bytes);
      if (!markdown.trim()) throw new Error('The README is empty');
      return markdown;
    }
  }

  statementTrigger.addEventListener('click', async () => {
    if (!statementOverlay.hidden) return;
    lastFocusedElement = document.activeElement;
    statementContent.replaceChildren();
    statementStatus.textContent = 'Loading the latest personal statement from GitHub…';
    statementStatus.hidden = false;
    statementOverlay.hidden = false;
    document.body.classList.add('statement-is-open');
    statementClose.focus();

    if (currentRequest) currentRequest.abort();
    const request = new AbortController();
    currentRequest = request;
    try {
      const markdown = await fetchStatement(request.signal);
      if (request.signal.aborted || statementOverlay.hidden) return;
      renderStatementMarkdown(markdown);
      statementStatus.hidden = true;
    } catch (error) {
      if (request.signal.aborted || statementOverlay.hidden) return;
      console.warn('Could not load personal statement from GitHub:', error);
      statementStatus.textContent = 'The personal statement could not be loaded right now. Please use “View original on GitHub” below.';
    } finally {
      if (currentRequest === request) currentRequest = null;
    }
  });

  statementClose.addEventListener('click', closeStatement);
  statementOverlay.addEventListener('click', event => {
    if (event.target === statementOverlay) closeStatement();
  });
  document.addEventListener('keydown', event => {
    if (statementOverlay.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeStatement();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...statementDialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) {
      event.preventDefault();
      statementDialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === statementDialog)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
}
