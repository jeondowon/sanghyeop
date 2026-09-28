(() => {
  const projects = [...document.querySelectorAll('[data-panel]')];
  const links = [...document.querySelectorAll('[data-project-link]')];
  const sidebar = document.querySelector('.sidebar');
  const menu = document.querySelector('.menu-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentProject = null;
  let scrollFrame = null;

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

  function updateCurrentProject() {
    scrollFrame = null;
    const readingLine = window.innerHeight * .3;
    const selected = projects.find(project => project.getBoundingClientRect().bottom > readingLine) || projects.at(-1);
    if (selected === currentProject) return;
    currentProject = selected;
    links.forEach(link => {
      if (link.hash === `#${selected.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    document.title = `${selected.dataset.title} — 이상협`;
  }

  function findTarget(hash) {
    const id = hash.slice(1);
    return document.getElementById(id === 'fantasy-warrior' ? 'other-works' : id);
  }

  function scrollToTarget(target, smooth = true) {
    document.querySelector('dialog[open]')?.close();
    setMenu(false);
    const focusTarget = target.querySelector('h1') || target;
    focusTarget.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant', block: 'start' });
  }

  document.addEventListener('click', event => {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const link = event.target.closest('a[href^="#"]');
    const target = link && findTarget(link.hash);
    if (!target) return;
    event.preventDefault();
    if (!link.classList.contains('skip-link') && window.location.hash !== link.hash) {
      window.history.pushState(null, '', link.hash);
    }
    scrollToTarget(target);
  });
  window.addEventListener('hashchange', () => {
    const target = findTarget(window.location.hash) || projects[0];
    scrollToTarget(target);
  });
  window.addEventListener('scroll', () => {
    if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateCurrentProject);
  }, { passive: true });
  window.addEventListener('resize', updateCurrentProject);
  window.addEventListener('load', () => {
    const target = findTarget(window.location.hash);
    if (target) scrollToTarget(target, false);
    updateCurrentProject();
  }, { once: true });
  updateCurrentProject();
})();
