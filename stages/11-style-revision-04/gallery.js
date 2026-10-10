(() => {
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
    const outgoing = document.createElement('span');
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

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  // Match object-fit: contain so portrait and landscape images share accurate coordinates.
  function imageBounds(image) {
    const rect = image.getBoundingClientRect();
    const ratio = Number(image.getAttribute('width')) / Number(image.getAttribute('height'));
    const width = Math.min(rect.width, rect.height * ratio);
    const height = width / ratio;
    return { left: rect.left + (rect.width - width) / 2, top: rect.top + (rect.height - height) / 2, width, height };
  }

  class Magnifier {
    constructor(gallery) {
      this.gallery = gallery;
      this.enabled = false;
      this.lens = document.createElement('span');
      this.lens.className = 'magnifier-lens';
      this.lens.setAttribute('aria-hidden', 'true');
      this.lens.hidden = true;
      gallery.surfaces.forEach((surface, index) => {
        surface.setAttribute('aria-pressed', 'false');
        surface.addEventListener('click', event => {
          if (gallery.suppressClickUntil > Date.now()) return;
          this.setEnabled(!this.enabled, index);
          if (this.enabled && event.detail && event.pointerType !== 'touch') this.point(index, event);
        });
        surface.addEventListener('pointerdown', event => {
          if (!this.enabled || !event.isPrimary || event.button !== 0) return;
          this.dragStart = { x: event.clientX, y: event.clientY, moved: false };
          surface.setPointerCapture(event.pointerId);
          this.point(index, event);
        });
        surface.addEventListener('pointermove', event => {
          if (!this.enabled || !event.isPrimary) return;
          if (this.dragStart && Math.hypot(event.clientX - this.dragStart.x, event.clientY - this.dragStart.y) > 6) {
            this.dragStart.moved = true;
          }
          this.point(index, event);
        });
        surface.addEventListener('pointerup', () => {
          if (this.dragStart?.moved) gallery.suppressClickUntil = Date.now() + 500;
          this.dragStart = null;
        });
        surface.addEventListener('pointercancel', () => { this.dragStart = null; this.hide(); });
        surface.addEventListener('lostpointercapture', () => { this.dragStart = null; });
        surface.addEventListener('pointerleave', event => {
          if (event.pointerType === 'mouse' && !this.dragStart) this.hide();
        });
        surface.addEventListener('blur', () => this.hide());
        surface.addEventListener('keydown', event => {
          if (!this.enabled || event.altKey || event.ctrlKey || event.metaKey) return;
          const steps = { ArrowLeft: [-.05, 0], ArrowRight: [.05, 0], ArrowUp: [0, -.05], ArrowDown: [0, .05] };
          const step = steps[event.key];
          if (!step) return;
          event.preventDefault();
          event.stopPropagation();
          const position = this.activeIndex === index ? this.position : { x: .5, y: .5 };
          this.show(index, position.x + step[0], position.y + step[1]);
        });
      });
      gallery.element.addEventListener('keydown', event => {
        if (event.key === 'Escape' && this.enabled) {
          event.preventDefault();
          this.setEnabled(false);
        }
      });
    }

    setEnabled(enabled, index = this.gallery.index) {
      if (enabled) galleries.forEach(gallery => {
        if (gallery !== this.gallery && gallery.magnifier.enabled) gallery.magnifier.setEnabled(false);
      });
      if (enabled) this.gallery.stopSlide?.();
      this.enabled = enabled;
      this.gallery.element.classList.toggle('is-magnifying', enabled);
      this.gallery.magnifyButton.setAttribute('aria-pressed', String(enabled));
      this.gallery.surfaces.forEach(surface => surface.setAttribute('aria-pressed', String(enabled)));
      this.gallery.updateImages();
      if (enabled) this.show(index, .5, .5);
      else this.hide();
    }

    hide() { this.lens.hidden = true; }

    point(index, event) {
      const bounds = imageBounds(this.gallery.images[index]);
      if (!bounds.width || !bounds.height) return;
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      if (event.pointerType === 'mouse' && (x < 0 || x > 1 || y < 0 || y > 1)) {
        this.hide();
        return;
      }
      this.show(index, x, y, event.pointerType === 'touch');
    }

    show(index, x, y, touch = false) {
      const surface = this.gallery.surfaces[index];
      const rect = surface.getBoundingClientRect();
      const bounds = imageBounds(this.gallery.images[index]);
      if (!bounds.width || !bounds.height) return;
      x = clamp(x, 0, 1);
      y = clamp(y, 0, 1);
      this.activeIndex = index;
      this.position = { x, y };
      const size = Math.min(244, rect.width * .64, rect.height, bounds.width * 3, bounds.height * 3);
      const left = clamp(bounds.left - rect.left + x * bounds.width - size / 2, 0, rect.width - size);
      const top = clamp(bounds.top - rect.top + y * bounds.height - (touch ? size + 28 : size / 2), 0, Math.max(0, rect.height - size));
      const backgroundX = clamp(size / 2 - x * bounds.width * 3, size - bounds.width * 3, 0);
      const backgroundY = clamp(size / 2 - y * bounds.height * 3, size - bounds.height * 3, 0);
      surface.append(this.lens);
      Object.assign(this.lens.style, {
        width: `${size}px`, height: `${size}px`, left: `${left}px`, top: `${top}px`,
        backgroundImage: `url("${surface.dataset.zoomSrc}")`,
        backgroundSize: `${bounds.width * 3}px ${bounds.height * 3}px`,
        backgroundPosition: `${backgroundX}px ${backgroundY}px`,
      });
      this.lens.hidden = false;
    }
  }

  class Gallery {
    constructor(element) {
      this.element = element;
      this.inViewport = false;
      this.figures = [...element.querySelectorAll('[data-artwork]')];
      this.surfaces = this.figures.map(figure => figure.querySelector('.artwork-surface'));
      this.images = this.figures.map(figure => figure.querySelector('img'));
      this.sources = this.images.map(image => ({
        image, src: image.getAttribute('src'), srcset: image.getAttribute('srcset'),
      }));
      this.index = 0;
      this.view = element.dataset.defaultView;
      this.items = element.querySelector('.gallery-items');
      this.createToolbar();
      this.createControls();
      this.magnifier = new Magnifier(this);
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
      this.magnifyButton = makeButton('돋보기 켜기 / 끄기', '돋보기', () => {
        this.magnifier.setEnabled(!this.magnifier.enabled);
        if (this.magnifier.enabled) this.surfaces[this.index].focus({ preventScroll: true });
      });
      this.magnifyButton.setAttribute('aria-pressed', 'false');
      if (this.figures.length > 1) {
        this.slideButton = makeButton('슬라이드로 보기', '슬라이드', () => this.setView('slides'));
        this.gridButton = makeButton('전체 이미지 보기', '전체 보기', () => this.setView('grid'));
        modes.append(this.slideButton, this.gridButton);
      }
      modes.append(this.magnifyButton);
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
      viewport.classList.toggle('has-slides', this.figures.length > 1);
      if (this.figures.length > 1) {
        const tallestRatio = Math.max(...this.images.map(image =>
          Number(image.getAttribute('height')) / Number(image.getAttribute('width'))
        ));
        viewport.style.setProperty('--tallest-image-ratio', tallestRatio);
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
      this.element.addEventListener('keydown', event => {
        const step = getArrowStep(event);
        if (!step || this.view !== 'slides' || this.figures.length < 2) return;
        event.preventDefault();
        const focusImage = event.target.closest('.artwork-surface');
        this.move(step);
        if (focusImage) this.surfaces[this.index].focus({ preventScroll: true });
      });
      attachSwipe(this.items, direction => {
        if (this.magnifier.enabled || this.view !== 'slides' || this.figures.length < 2) return;
        this.suppressClickUntil = Date.now() + 350;
        this.move(direction);
      });
    }

    updateImages() {
      const visible = this.inViewport;
      const sizes = this.view === 'grid'
        ? '(max-width: 1000px) calc(100vw - 32px), 35vw'
        : '(max-width: 1000px) calc(100vw - 32px), 70vw';
      this.sources.forEach((source, index) => {
        const active = visible && this.view === 'slides' && index === this.index;
        const animate = active && !this.magnifier.enabled && source.image.dataset.animation && !reducedMotion.matches;
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
      this.magnifier.setEnabled(false);
      this.stopSlide?.();
      this.view = view;
      this.render();
    }
    select(index, direction = Math.sign(index - this.index)) {
      if (index === this.index) return;
      this.magnifier.setEnabled(false);
      const previous = this.images[this.index].cloneNode(true);
      this.stopSlide?.();
      this.index = index;
      this.render();
      if (this.view === 'slides') {
        this.stopSlide = slideArtwork(this.surfaces[index], this.images[index], previous, direction);
      }
    }
    move(step) { this.select((this.index + step + this.figures.length) % this.figures.length, Math.sign(step)); }
    render() {
      this.element.dataset.view = this.view;
      if (this.view === 'slides' && this.figures.length > 1) this.element.setAttribute('aria-roledescription', 'carousel');
      else this.element.removeAttribute('aria-roledescription');
      this.figures.forEach((figure, index) => { figure.hidden = this.view === 'slides' && index !== this.index; });
      this.updateImages();
      this.counter.textContent = `${String(this.index + 1).padStart(2, '0')} / ${String(this.figures.length).padStart(2, '0')}`;
      this.slideButton?.setAttribute('aria-pressed', String(this.view === 'slides'));
      this.gridButton?.setAttribute('aria-pressed', String(this.view === 'grid'));
      this.controls.hidden = this.view === 'grid' || this.figures.length < 2;
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
      if (!entry.isIntersecting && gallery.magnifier.enabled) gallery.magnifier.setEnabled(false);
      gallery.updateImages();
    });
  }, { rootMargin: '200px 0px' });
  galleries.forEach(gallery => galleryObserver.observe(gallery.element));
  window.addEventListener('resize', () => galleries.forEach(gallery => gallery.magnifier.hide()));
  reducedMotion.addEventListener('change', () => {
    galleries.forEach(gallery => {
      gallery.stopSlide?.();
      gallery.updateImages();
    });
  });
})();
