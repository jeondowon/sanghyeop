(() => {
  const dialog = document.querySelector('.lightbox');
  const dialogImage = dialog.querySelector('.lightbox-art img');
  const dialogTitle = dialog.querySelector('[data-lightbox-title]');
  const dialogProject = dialog.querySelector('[data-lightbox-project]');
  const dialogCount = dialog.querySelector('[data-lightbox-count]');
  const dialogPrevious = dialog.querySelector('[data-lightbox-prev]');
  const dialogNext = dialog.querySelector('[data-lightbox-next]');
  let openGallery = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const galleries = [];

  function makeButton(label, text, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }

  function renderDialog() {
    const figure = openGallery.figures[openGallery.index];
    const source = figure.querySelector('img');
    dialogImage.src = source.dataset.animation && !reducedMotion.matches
      ? source.dataset.animation
      : figure.querySelector('.artwork-open').href;
    dialogImage.alt = figure.dataset.title;
    dialogTitle.textContent = figure.dataset.title;
    dialogProject.textContent = openGallery.element.closest('[data-panel]').dataset.title;
    dialogCount.textContent = `${openGallery.index + 1} / ${openGallery.figures.length}`;
    dialogPrevious.hidden = dialogNext.hidden = openGallery.figures.length < 2;
  }

  class Gallery {
    constructor(element) {
      this.element = element;
      this.figures = [...element.querySelectorAll('[data-artwork]')];
      this.sources = this.figures.map(figure => {
        const image = figure.querySelector('img');
        return { image, src: image.getAttribute('src'), srcset: image.getAttribute('srcset') };
      });
      this.index = 0;
      this.view = element.dataset.defaultView;
      const toolbar = document.createElement('div');
      toolbar.className = 'gallery-toolbar';
      const total = document.createElement('span');
      total.textContent = `${String(this.figures.length).padStart(2, '0')} ${this.figures.length === 1 ? 'Image' : 'Images'}`;
      toolbar.append(total);
      this.slideButton = makeButton('슬라이드로 보기', '슬라이드', () => this.setView('slides'));
      this.gridButton = makeButton('전체 이미지 보기', '전체 보기', () => this.setView('grid'));
      if (this.figures.length > 1) {
        const modes = document.createElement('div');
        modes.className = 'view-switch';
        modes.append(this.slideButton, this.gridButton);
        toolbar.append(modes);
      }
      element.prepend(toolbar);

      this.controls = document.createElement('div');
      this.controls.className = 'gallery-controls';
      const arrows = document.createElement('div');
      arrows.className = 'slide-controls';
      this.counter = document.createElement('span');
      this.counter.setAttribute('aria-live', 'polite');
      this.counter.setAttribute('aria-atomic', 'true');
      if (this.figures.length > 1) arrows.append(makeButton('이전 이미지', '←', () => this.move(-1)));
      arrows.append(this.counter);
      if (this.figures.length > 1) arrows.append(makeButton('다음 이미지', '→', () => this.move(1)));
      this.controls.append(arrows);
      this.thumbnails = document.createElement('div');
      this.thumbnails.className = 'thumbnails';
      this.thumbnails.setAttribute('aria-label', '작품 이미지 선택');
      this.thumbnailButtons = this.figures.map((figure, index) => {
        const thumbnail = makeButton(`${index + 1}. ${figure.dataset.title}`, '', () => this.select(index));
        const image = document.createElement('img');
        image.src = figure.querySelector('img').getAttribute('src').replace('-1800.webp', '-400.webp');
        image.alt = '';
        image.loading = 'lazy';
        thumbnail.append(image);
        this.thumbnails.append(thumbnail);
        figure.querySelector('.artwork-open').addEventListener('click', event => {
          event.preventDefault();
          if (this.suppressClick) return;
          this.select(index);
          openGallery = this;
          renderDialog();
          dialog.showModal();
        });
        return thumbnail;
      });
      element.append(this.controls, this.thumbnails);
      element.classList.add('gallery--enhanced');
      element.setAttribute('role', 'region');
      element.setAttribute('aria-label', `${element.closest('[data-panel]').dataset.title} 이미지 갤러리`);
      element.addEventListener('keydown', event => {
        if (this.view !== 'slides' || this.figures.length < 2 || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          const focusImage = event.target.closest('.artwork-open');
          this.move(event.key === 'ArrowLeft' ? -1 : 1);
          if (focusImage) this.figures[this.index].querySelector('.artwork-open').focus({ preventScroll: true });
        }
      });
      attachSwipe(element.querySelector('.gallery-items'), direction => {
        if (this.view !== 'slides' || this.figures.length < 2) return;
        this.suppressClick = true;
        this.move(direction);
        window.setTimeout(() => { this.suppressClick = false; }, 350);
      });
      this.render();
    }
    updateImages() {
      const visible = !this.element.closest('[data-panel]').hidden;
      this.sources.forEach((source, index) => {
        const active = visible && this.view === 'slides' && index === this.index;
        const animate = active && source.image.dataset.animation && !reducedMotion.matches;
        if (animate) source.image.removeAttribute('srcset');
        else if (source.srcset) source.image.setAttribute('srcset', source.srcset);
        const desired = animate ? source.image.dataset.animation : source.src;
        if (source.image.getAttribute('src') !== desired) source.image.setAttribute('src', desired);
        source.image.sizes = this.view === 'grid'
          ? '(max-width: 760px) 42vw, (max-width: 1100px) 28vw, 22vw'
          : '(max-width: 760px) calc(100vw - 40px), 65vw';
        if (active) source.image.loading = 'eager';
      });
    }
    setView(view) { this.view = view; this.render(); }
    select(index) {
      this.index = index;
      this.render();
      if (dialog.open && openGallery === this) renderDialog();
    }
    move(step) { this.select((this.index + step + this.figures.length) % this.figures.length); }
    render() {
      this.element.dataset.view = this.view;
      if (this.view === 'slides') this.element.setAttribute('aria-roledescription', 'carousel');
      else this.element.removeAttribute('aria-roledescription');
      this.updateImages();
      this.figures.forEach((figure, index) => { figure.hidden = this.view === 'slides' && index !== this.index; });
      this.counter.textContent = `${String(this.index + 1).padStart(2, '0')} / ${String(this.figures.length).padStart(2, '0')}`;
      this.slideButton.setAttribute('aria-pressed', String(this.view === 'slides'));
      this.gridButton.setAttribute('aria-pressed', String(this.view === 'grid'));
      this.controls.hidden = this.view === 'grid';
      this.thumbnails.hidden = this.view === 'grid' || this.figures.length < 2;
      this.thumbnailButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === this.index)));
      const active = this.thumbnailButtons[this.index];
      this.thumbnails.scrollTo({ left: Math.max(0, active.offsetLeft - this.thumbnails.clientWidth / 2 + active.clientWidth / 2), behavior: 'instant' });
    }
  }

  function attachSwipe(element, move) {
    let start = null;
    element.addEventListener('touchstart', event => {
      start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }, { passive: true });
    element.addEventListener('touchcancel', () => { start = null; }, { passive: true });
    element.addEventListener('touchend', event => {
      if (!start || !event.changedTouches.length) return;
      const dx = event.changedTouches[0].clientX - start.x;
      const dy = event.changedTouches[0].clientY - start.y;
      start = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  document.querySelectorAll('[data-gallery]').forEach(element => galleries.push(new Gallery(element)));
  dialog.addEventListener('keydown', event => {
    if (!openGallery || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      openGallery.move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('close', () => {
    const gallery = openGallery;
    openGallery = null;
    dialogImage.removeAttribute('src');
    if (gallery && !gallery.element.closest('[data-panel]').hidden) {
      gallery.figures[gallery.index].querySelector('.artwork-open').focus({ preventScroll: true });
    }
  });
  attachSwipe(dialog.querySelector('.lightbox-art'), direction => openGallery?.move(direction));
  document.addEventListener('portfolio:projectchange', () => galleries.forEach(gallery => gallery.updateImages()));
  reducedMotion.addEventListener('change', () => {
    galleries.forEach(gallery => gallery.updateImages());
    if (dialog.open && openGallery) renderDialog();
  });
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialogPrevious.addEventListener('click', () => openGallery.move(-1));
  dialogNext.addEventListener('click', () => openGallery.move(1));
})();
