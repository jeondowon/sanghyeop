(() => {
  const dialog = document.querySelector('.lightbox');
  const dialogArt = dialog.querySelector('.lightbox-art');
  const dialogProject = dialog.querySelector('[data-lightbox-project]');
  const dialogCount = dialog.querySelector('[data-lightbox-count]');
  const dialogPrevious = dialog.querySelector('[data-lightbox-prev]');
  const dialogNext = dialog.querySelector('[data-lightbox-next]');
  let openGallery = null;
  let stopDialogSlide = null;
  let dialogSuppressClickUntil = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const galleries = new Map();

  function makeButton(label, text, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }

  function getArrowStep(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return 0;
    if (event.key === 'ArrowLeft') return -1;
    if (event.key === 'ArrowRight') return 1;
    return 0;
  }

  function slideArtwork(container, image, previous, direction) {
    if (!previous || !direction || reducedMotion.matches) return null;
    const outgoing = document.createElement('div');
    outgoing.className = 'slide-outgoing';
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.append(previous);
    container.append(outgoing);
    const timing = { duration: 1000, easing: 'cubic-bezier(.45, 0, .25, 1)' };
    const animations = [
      image.animate([{ transform: `translateX(${direction * 100}%)` }, { transform: 'translateX(0)' }], timing),
      outgoing.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-direction * 100}%)` }], timing),
    ];
    const stop = () => {
      animations.forEach(animation => { animation.onfinish = null; animation.cancel(); });
      outgoing.remove();
    };
    animations[0].onfinish = stop;
    return stop;
  }

  function renderDialog(direction = 0) {
    const previous = dialogArt.firstElementChild?.cloneNode(true);
    stopDialogSlide?.();
    const figure = openGallery.figures[openGallery.index];
    const link = openGallery.links[openGallery.index];
    const source = openGallery.images[openGallery.index];
    const image = source.cloneNode(true);
    if (image.tagName === 'IMG') {
      image.removeAttribute('srcset');
      image.loading = 'eager';
      image.src = source.dataset.animation && !reducedMotion.matches ? source.dataset.animation : link.href;
      image.alt = figure.dataset.title;
    }
    image.setAttribute('title', '클릭하면 확대 보기 닫기');
    dialogArt.replaceChildren(image);
    stopDialogSlide = slideArtwork(dialogArt, image, previous, direction);
    const projectTitle = openGallery.panel.querySelector('h1').textContent.trim();
    const artworkTitle = openGallery.element.dataset.label === 'AI Image Generation'
      ? openGallery.element.dataset.label : figure.dataset.title;
    const hasMultipleWorks = openGallery.panel.querySelectorAll('[data-gallery]').length > 1;
    dialogProject.textContent = hasMultipleWorks
      ? `${projectTitle} / ${artworkTitle}` : projectTitle;
    dialogCount.textContent = `${openGallery.index + 1} / ${openGallery.figures.length}`;
    dialogPrevious.hidden = dialogNext.hidden = openGallery.figures.length < 2;
  }

  function addDetailViews(element) {
    element.querySelectorAll('[data-detail-views]').forEach(original => {
      const source = original.querySelector('img');
      const width = Number(source.getAttribute('width'));
      const height = Number(source.getAttribute('height'));
      const details = JSON.parse(original.dataset.detailViews);
      details.forEach(detail => {
        const figure = document.createElement('figure');
        figure.className = 'artwork';
        figure.dataset.artwork = '';
        figure.dataset.title = `${original.dataset.title} — ${detail.label}`;
        const link = original.querySelector('.artwork-open').cloneNode(false);
        link.setAttribute('aria-label', `${figure.dataset.title} 확대 보기`);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const [x, y, w, h] = detail.box;
        const viewBox = `${x * width} ${y * height} ${w * width} ${h * height}`;
        svg.setAttribute('viewBox', viewBox);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', figure.dataset.title);
        // Clip to the selected rectangle even when the outer viewport has letterboxing.
        const crop = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        crop.setAttribute('x', x * width);
        crop.setAttribute('y', y * height);
        crop.setAttribute('width', w * width);
        crop.setAttribute('height', h * height);
        crop.setAttribute('viewBox', viewBox);
        crop.setAttribute('overflow', 'hidden');
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.dataset.src = source.getAttribute('src');
        image.setAttribute('width', width);
        image.setAttribute('height', height);
        crop.append(image);
        svg.append(crop);
        link.append(svg);
        figure.append(link);
        original.parentElement.append(figure);
      });
    });
  }

  class Gallery {
    constructor(element) {
      this.element = element;
      this.panel = element.closest('[data-panel]');
      this.inViewport = false;
      addDetailViews(element);
      this.figures = [...element.querySelectorAll('[data-artwork]')];
      this.links = this.figures.map(figure => figure.querySelector('.artwork-open'));
      this.images = this.figures.map(figure => figure.querySelector('img, svg'));
      this.sources = this.images.map(image => ({
        image, src: image.getAttribute('src'), srcset: image.getAttribute('srcset'),
      }));
      this.index = 0;
      this.view = element.dataset.defaultView;
      this.items = element.querySelector('.gallery-items');
      this.createToolbar();
      this.createControls();
      this.bindEvents();
      element.classList.add('gallery--enhanced');
      element.setAttribute('role', 'region');
      element.setAttribute('aria-label', `${element.dataset.label} 이미지 갤러리`);
      this.render();
    }

    createToolbar() {
      const toolbar = document.createElement('div');
      toolbar.className = 'gallery-toolbar';
      const modes = document.createElement('div');
      modes.className = 'view-switch';
      this.zoomButton = makeButton('현재 이미지 확대 보기', '확대 보기', () => this.open(this.index, this.zoomButton));
      this.zoomButton.setAttribute('aria-haspopup', 'dialog');
      if (this.figures.length > 1) {
        this.slideButton = makeButton('슬라이드로 보기', '슬라이드', () => this.setView('slides'));
        this.gridButton = makeButton('전체 이미지 보기', '전체 보기', () => this.setView('grid'));
        modes.append(this.slideButton, this.gridButton);
      }
      modes.append(this.zoomButton);
      toolbar.append(modes);
      this.element.prepend(toolbar);
    }

    createControls() {
      this.controls = document.createElement('div');
      this.controls.className = 'gallery-controls';
      const viewport = document.createElement('div');
      viewport.className = 'gallery-viewport';
      this.items.replaceWith(viewport);
      viewport.append(this.items);
      this.arrows = [];
      if (this.figures.length > 1) {
        const previous = makeButton('이전 이미지', '←', () => this.move(-1));
        const next = makeButton('다음 이미지', '→', () => this.move(1));
        previous.className = 'gallery-arrow gallery-arrow--previous';
        next.className = 'gallery-arrow gallery-arrow--next';
        this.arrows.push(previous, next);
        viewport.append(previous, next);
      }
      this.counter = document.createElement('span');
      this.counter.setAttribute('aria-live', 'polite');
      this.counter.setAttribute('aria-atomic', 'true');
      this.controls.append(this.counter);
      this.element.append(this.controls);
    }

    bindEvents() {
      this.links.forEach((link, index) => {
        link.addEventListener('click', event => {
          event.preventDefault();
          if (this.suppressClickUntil > Date.now()) return;
          this.open(index);
        });
      });
      this.element.addEventListener('keydown', event => {
        const step = getArrowStep(event);
        if (!step || this.view !== 'slides' || this.figures.length < 2) return;
        event.preventDefault();
        const focusImage = event.target.closest('.artwork-open');
        this.move(step);
        if (focusImage) this.links[this.index].focus({ preventScroll: true });
      });
      attachSwipe(this.items, direction => {
        if (this.view !== 'slides' || this.figures.length < 2) return;
        this.suppressClickUntil = Date.now() + 350;
        this.move(direction);
      });
    }

    open(index = this.index, trigger = null) {
      this.select(index);
      this.dialogTrigger = trigger;
      openGallery = this;
      renderDialog();
      dialog.showModal();
    }
    updateImages() {
      const visible = this.inViewport;
      const sizes = this.view === 'grid'
        ? '(max-width: 760px) 42vw, (max-width: 1100px) 28vw, 30vw'
        : '(max-width: 760px) calc(100vw - 40px), 60vw';
      this.sources.forEach((source, index) => {
        const active = visible && this.view === 'slides' && index === this.index;
        if (source.image.tagName !== 'IMG') {
          const detail = source.image.querySelector('image');
          if ((active || (visible && this.view === 'grid')) && !detail.hasAttribute('href')) {
            detail.setAttribute('href', detail.dataset.src);
          }
          return;
        }
        const animate = active && source.image.dataset.animation && !reducedMotion.matches;
        if (animate) source.image.removeAttribute('srcset');
        else if (source.srcset && source.image.getAttribute('srcset') !== source.srcset) {
          source.image.setAttribute('srcset', source.srcset);
        }
        const desired = animate ? source.image.dataset.animation : source.src;
        if (source.image.getAttribute('src') !== desired) source.image.setAttribute('src', desired);
        if (source.image.sizes !== sizes) source.image.sizes = sizes;
        source.image.loading = active || source.image.fetchPriority === 'high' ? 'eager' : 'lazy';
      });
    }
    setView(view) {
      this.stopSlide?.();
      this.view = view;
      this.render();
    }
    select(index, direction = Math.sign(index - this.index)) {
      if (index === this.index) return;
      const previous = this.images[this.index].cloneNode(true);
      this.stopSlide?.();
      this.index = index;
      this.render();
      if (dialog.open && openGallery === this) renderDialog(direction);
      else if (this.view === 'slides') {
        this.stopSlide = slideArtwork(this.links[index], this.images[index], previous, direction);
      }
    }
    move(step) { this.select((this.index + step + this.figures.length) % this.figures.length, Math.sign(step)); }
    render() {
      this.element.dataset.view = this.view;
      if (this.view === 'slides') this.element.setAttribute('aria-roledescription', 'carousel');
      else this.element.removeAttribute('aria-roledescription');
      this.figures.forEach((figure, index) => { figure.hidden = this.view === 'slides' && index !== this.index; });
      this.updateImages();
      this.counter.textContent = `${String(this.index + 1).padStart(2, '0')} / ${String(this.figures.length).padStart(2, '0')}`;
      this.slideButton?.setAttribute('aria-pressed', String(this.view === 'slides'));
      this.gridButton?.setAttribute('aria-pressed', String(this.view === 'grid'));
      this.controls.hidden = this.view === 'grid';
      this.arrows.forEach(arrow => { arrow.hidden = this.view === 'grid'; });
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

  document.querySelectorAll('[data-gallery]').forEach(element => galleries.set(element, new Gallery(element)));
  const galleryObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const gallery = galleries.get(entry.target);
      gallery.inViewport = entry.isIntersecting;
      gallery.updateImages();
    });
  }, { rootMargin: '200px 0px' });
  galleries.forEach(gallery => galleryObserver.observe(gallery.element));
  dialog.addEventListener('keydown', event => {
    const step = getArrowStep(event);
    if (!openGallery || !step) return;
    event.preventDefault();
    openGallery.move(step);
  });
  dialog.addEventListener('close', () => {
    stopDialogSlide?.();
    const gallery = openGallery;
    openGallery = null;
    dialogArt.replaceChildren();
    if (gallery) {
      (gallery.dialogTrigger || gallery.links[gallery.index]).focus({ preventScroll: true });
    }
  });
  dialogArt.addEventListener('click', event => {
    if (Date.now() < dialogSuppressClickUntil) return;
    if (event.target.closest('img, svg')) dialog.close();
  });
  attachSwipe(dialogArt, direction => {
    dialogSuppressClickUntil = Date.now() + 350;
    openGallery?.move(direction);
  });
  reducedMotion.addEventListener('change', () => {
    galleries.forEach(gallery => {
      gallery.stopSlide?.();
      gallery.updateImages();
    });
    if (dialog.open && openGallery) renderDialog();
  });
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialogPrevious.addEventListener('click', () => openGallery.move(-1));
  dialogNext.addEventListener('click', () => openGallery.move(1));
})();
