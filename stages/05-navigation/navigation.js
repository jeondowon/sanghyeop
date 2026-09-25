(() => {
  const panels = [...document.querySelectorAll('[data-panel]')];
  const links = [...document.querySelectorAll('[data-project-link], [data-about-link]')];
  const breadcrumb = document.querySelector('[data-breadcrumb]');
  const counter = document.querySelector('[data-project-count]');

  function showProject() {
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
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  window.addEventListener('hashchange', showProject);
  showProject();
})();
