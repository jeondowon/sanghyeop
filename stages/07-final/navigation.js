(() => {
  const panels = [...document.querySelectorAll('[data-panel]')];
  const links = [...document.querySelectorAll('[data-project-link], [data-about-link]')];
  const breadcrumb = document.querySelector('[data-breadcrumb]');
  const counter = document.querySelector('[data-project-count]');
  const sidebar = document.querySelector('.sidebar');
  const menu = document.querySelector('.menu-toggle');
  const main = document.querySelector('#main');

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
    if (window.location.hash === '#main') {
      main.focus({ preventScroll: true });
      main.scrollIntoView();
      return;
    }
    const id = window.location.hash.slice(1);
    const selected = panels.find(panel => panel.id === id) || panels[0];
    document.querySelector('dialog[open]')?.close();
    panels.forEach(panel => { panel.hidden = panel !== selected; });
    links.forEach(link => {
      if (link.hash === `#${selected.id}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    breadcrumb.textContent = selected.id === 'about' ? 'Portfolio / About' : 'Portfolio / Selected works';
    counter.textContent = selected.dataset.number ? `${selected.dataset.number} — 10` : 'Designer profile';
    document.title = `${selected.dataset.title} — 이상협`;
    setMenu(false);
    selected.querySelector('.gallery-items img')?.setAttribute('loading', 'eager');
    if (focus) selected.querySelector('h1').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.dispatchEvent(new CustomEvent('portfolio:projectchange', { detail: { id: selected.id } }));
  }

  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    main.focus({ preventScroll: true });
    main.scrollIntoView();
  });
  document.addEventListener('click', event => {
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
