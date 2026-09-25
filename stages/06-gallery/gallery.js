(() => {
  const dialog = document.querySelector('.lightbox');
  const dialogImage = dialog.querySelector('.lightbox-art img');
  const dialogTitle = dialog.querySelector('[data-lightbox-title]');
  const dialogProject = dialog.querySelector('[data-lightbox-project]');
  const dialogCount = dialog.querySelector('[data-lightbox-count]');
  const dialogPrevious = dialog.querySelector('[data-lightbox-prev]');
  const dialogNext = dialog.querySelector('[data-lightbox-next]');
  let openGallery = null;

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
    dialogImage.src = figure.querySelector('.artwork-open').href;
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
          this.select(index);
          openGallery = this;
          renderDialog();
          dialog.showModal();
        });
        return thumbnail;
      });
      element.append(this.controls, this.thumbnails);
      element.classList.add('gallery--enhanced');
      this.render();
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

  document.querySelectorAll('[data-gallery]').forEach(element => new Gallery(element));
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialogPrevious.addEventListener('click', () => openGallery.move(-1));
  dialogNext.addEventListener('click', () => openGallery.move(1));
})();
