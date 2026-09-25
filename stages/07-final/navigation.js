(() => {
  const panels = [...document.querySelectorAll('[data-panel]')];
  const links = [...document.querySelectorAll('[data-project-link], [data-about-link]')];
  const breadcrumb = document.querySelector('[data-breadcrumb]');
  const counter = document.querySelector('[data-project-count]');
  const projectCount = panels.filter(panel => panel.dataset.number).length;
  const sidebar = document.querySelector('.sidebar');
  const menu = document.querySelector('.menu-toggle');
  const main = document.querySelector('#main');
  let currentPanel = panels[0];

  function setMenu(open) {
    sidebar.dataset.menuOpen = String(open);
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? '닫기 −' : '작품 목록 +';
  }
  menu.hidden = false;
  setMenu(false);
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  sidebar.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });

  function showProject(focus = false) {
    const id = window.location.hash.slice(1);
    const skipToMain = id === 'main';
    const selected = skipToMain ? currentPanel : panels.find(panel => panel.id === id) || panels[0];
    currentPanel = selected;
    document.querySelector('dialog[open]')?.close();
    panels.forEach(panel => { panel.hidden = panel !== selected; });
    links.forEach(link => {
      if (link.hash === `#${selected.id}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    breadcrumb.textContent = selected.id === 'about' ? 'Portfolio / About' : 'Portfolio / Selected works';
    counter.textContent = selected.dataset.number ? `${selected.dataset.number} — ${projectCount}` : 'Designer profile';
    document.title = `${selected.dataset.title} — 이상협`;
    setMenu(false);
    if (focus && !skipToMain) selected.querySelector('h1').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.dispatchEvent(new CustomEvent('portfolio:projectchange', { detail: { id: selected.id } }));
    if (skipToMain) {
      main.focus({ preventScroll: true });
      main.scrollIntoView();
    }
  }

  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    main.focus({ preventScroll: true });
    main.scrollIntoView();
  });
  document.addEventListener('click', event => {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.classList.contains('skip-link')) return;
    if (link.hash === window.location.hash) {
      event.preventDefault();
      showProject(true);
    }
  });
  window.addEventListener('hashchange', () => showProject(true));
  showProject();
})();
