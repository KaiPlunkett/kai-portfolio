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


// Progressive enhancement: with JavaScript disabled, the link still opens GitHub.
// Fetch the current public Markdown directly from GitHub each time the modal opens.
const statementTrigger = document.getElementById('personal-statement-trigger');
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

if (statementTrigger && statementDialog && typeof statementDialog.showModal === 'function') {
  statementTrigger.addEventListener('click', async event => {
    event.preventDefault();
    statementContent.replaceChildren();
    statementStatus.textContent = 'Loading the latest personal statement from GitHub…';
    statementStatus.hidden = false;
    statementDialog.showModal();
    statementClose.focus();
    try {
      const response = await fetch(statementSource, {cache: 'no-store'});
      if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
      const markdown = await response.text();
      if (!markdown.trim()) throw new Error('The README is empty');
      renderStatementMarkdown(markdown);
      statementStatus.hidden = true;
    } catch (error) {
      console.warn('Could not load personal statement from GitHub:', error);
      statementStatus.textContent = 'The personal statement could not be loaded right now. Please use “View original on GitHub” below.';
    }
  });
  statementClose.addEventListener('click', () => statementDialog.close());
  statementDialog.addEventListener('click', event => {
    // Close only when the shaded backdrop itself is clicked.
    if (event.target === statementDialog) statementDialog.close();
  });
}
