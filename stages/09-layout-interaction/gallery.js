(() => {
  const dialog = document.querySelector('.lightbox');
  const dialogArt = dialog.querySelector('.lightbox-art');
  const dialogTitle = dialog.querySelector('[data-lightbox-title]');
  const dialogProject = dialog.querySelector('[data-lightbox-project]');
  const dialogCount = dialog.querySelector('[data-lightbox-count]');
  const dialogPrevious = dialog.querySelector('[data-lightbox-prev]');
  const dialogNext = dialog.querySelector('[data-lightbox-next]');
  let openGallery = null;
  let stopDialogSlide = null;
  let dialogSuppressClickUntil = 0;
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

  function slideArtwork(container, image, previous, direction) {
    if (!previous || !direction || reducedMotion.matches) return null;
    const outgoing = document.createElement('div');
    outgoing.className = 'slide-outgoing';
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.append(previous);
    container.append(outgoing);
    const timing = { duration: 320, easing: 'cubic-bezier(.22, .61, .36, 1)' };
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
    dialogTitle.textContent = figure.dataset.title;
    dialogProject.textContent = openGallery.panel.dataset.title;
    dialogCount.textContent = `${openGallery.index + 1} / ${openGallery.figures.length}`;
    dialogPrevious.hidden = dialogNext.hidden = openGallery.figures.length < 2;
  }

  function addDetailViews(element) {
    element.querySelectorAll('[data-detail-views]').forEach(original => {
      const source = original.querySelector('img');
      const width = Number(source.getAttribute('width'));
      const height = Number(source.getAttribute('height'));
      const details = JSON.parse(original.dataset.detailViews);
      original.querySelector('figcaption').textContent = '전체 이미지';
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
        const caption = document.createElement('figcaption');
        caption.textContent = detail.label;
        figure.append(link, caption);
        original.parentElement.append(figure);
      });
    });
  }

  class Gallery {
    constructor(element) {
      this.element = element;
      this.panel = element.closest('[data-panel]');
      addDetailViews(element);
      this.figures = [...element.querySelectorAll('[data-artwork]')];
      this.links = this.figures.map(figure => figure.querySelector('.artwork-open'));
      this.images = this.figures.map(figure => figure.querySelector('img, svg'));
      this.sources = this.images.map(image => ({
        image, src: image.getAttribute('src'), srcset: image.getAttribute('srcset'),
      }));
      this.index = 0;
      this.view = element.dataset.defaultView;
      const toolbar = document.createElement('div');
      toolbar.className = 'gallery-toolbar';
      const total = document.createElement('span');
      total.textContent = element.querySelector('[data-detail-views]')
        ? '전체 이미지 · 세부 3곳'
        : `AI 생성 이미지 · ${this.figures.length}점`;
      toolbar.append(total);
      if (this.figures.length > 1) {
        this.slideButton = makeButton('슬라이드로 보기', '슬라이드', () => this.setView('slides'));
        this.gridButton = makeButton('전체 이미지 보기', '전체 보기', () => this.setView('grid'));
        const modes = document.createElement('div');
        modes.className = 'view-switch';
        modes.append(this.slideButton, this.gridButton);
        toolbar.append(modes);
      }
      element.prepend(toolbar);

      this.controls = document.createElement('div');
      this.controls.className = 'gallery-controls';
      const items = element.querySelector('.gallery-items');
      this.viewport = document.createElement('div');
      this.viewport.className = 'gallery-viewport';
      items.replaceWith(this.viewport);
      this.viewport.append(items);
      this.arrows = [];
      if (this.figures.length > 1) {
        const previous = makeButton('이전 이미지', '←', () => this.move(-1));
        const next = makeButton('다음 이미지', '→', () => this.move(1));
        previous.className = 'gallery-arrow gallery-arrow--previous';
        next.className = 'gallery-arrow gallery-arrow--next';
        this.arrows.push(previous, next);
        this.viewport.append(previous, next);
      }
      this.counter = document.createElement('span');
      this.counter.setAttribute('aria-live', 'polite');
      this.counter.setAttribute('aria-atomic', 'true');
      this.controls.append(this.counter);
      this.thumbnails = document.createElement('div');
      this.thumbnails.className = 'thumbnails';
      this.thumbnails.setAttribute('aria-label', '작품 이미지 선택');
      this.thumbnailButtons = this.figures.length > 1 ? this.figures.map((figure, index) => {
        const thumbnail = makeButton(`${index + 1}. ${figure.dataset.title}`, '', () => this.select(index));
        const source = this.images[index];
        const image = source.cloneNode(true);
        if (image.tagName === 'IMG') {
          image.removeAttribute('srcset');
          image.removeAttribute('fetchpriority');
          image.src = this.sources[index].src.replace('-1800.webp', '-400.webp');
          image.alt = '';
          image.loading = 'lazy';
        } else {
          const detail = image.querySelector('image');
          detail.setAttribute('href', detail.dataset.src.replace('-1800.webp', '-400.webp'));
          image.removeAttribute('aria-label');
          image.setAttribute('aria-hidden', 'true');
        }
        thumbnail.append(image);
        this.thumbnails.append(thumbnail);
        return thumbnail;
      }) : [];
      this.links.forEach((link, index) => {
        link.addEventListener('click', event => {
          event.preventDefault();
          if (this.suppressClickUntil > Date.now()) return;
          this.select(index);
          openGallery = this;
          renderDialog();
          dialog.showModal();
        });
      });
      element.append(this.controls, this.thumbnails);
      element.classList.add('gallery--enhanced');
      element.setAttribute('role', 'region');
      element.setAttribute('aria-label', `${element.dataset.label} 이미지 갤러리`);
      element.addEventListener('keydown', event => {
        if (this.view !== 'slides' || this.figures.length < 2 || event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          const focusImage = event.target.closest('.artwork-open');
          this.move(event.key === 'ArrowLeft' ? -1 : 1);
          if (focusImage) this.links[this.index].focus({ preventScroll: true });
        }
      });
      attachSwipe(element.querySelector('.gallery-items'), direction => {
        if (this.view !== 'slides' || this.figures.length < 2) return;
        this.suppressClickUntil = Date.now() + 350;
        this.move(direction);
      });
      this.render();
    }
    updateImages() {
      const visible = !this.panel.hidden;
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
        const sizes = this.view === 'grid'
          ? '(max-width: 760px) 42vw, (max-width: 1100px) 28vw, 30vw'
          : '(max-width: 760px) calc(100vw - 40px), 60vw';
        if (source.image.sizes !== sizes) source.image.sizes = sizes;
        source.image.loading = active ? 'eager' : 'lazy';
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
      else if (this.view === 'slides' && !this.panel.hidden) {
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
      this.thumbnails.hidden = this.view === 'grid' || this.figures.length < 2;
      this.thumbnailButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === this.index)));
      const active = this.thumbnailButtons[this.index];
      if (active && !this.thumbnails.hidden && !this.panel.hidden) {
        this.thumbnails.scrollTo({ left: Math.max(0, active.offsetLeft - this.thumbnails.clientWidth / 2 + active.clientWidth / 2), behavior: 'instant' });
      }
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
    stopDialogSlide?.();
    const gallery = openGallery;
    openGallery = null;
    dialogArt.replaceChildren();
    if (gallery && !gallery.panel.hidden) {
      gallery.links[gallery.index].focus({ preventScroll: true });
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
  document.addEventListener('portfolio:projectchange', () => galleries.forEach(gallery => {
    gallery.stopSlide?.();
    gallery.updateImages();
  }));
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
