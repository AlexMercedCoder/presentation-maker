import { store } from '../core/Store';
import { LayoutEngine } from '../layouts/LayoutEngine';

export const EditorCanvas = {
  render() {
    const activeSlide = store.activeSlide;
    if (!activeSlide) return '<div class="no-slide">No slide selected</div>';

    // We pass 'true' for editable mode
    return LayoutEngine.render(activeSlide, true); 
  },

  attachEvents(container) {
    const activeSlide = store.activeSlide;
    if (!activeSlide) return;

    // Title Editing
    const titleEl = container.querySelector('[data-editable="title"]');
    if (titleEl) {
      titleEl.addEventListener('input', (e) => {
        store.updateSlideContent(activeSlide.id, { title: e.target.innerText });
      });
    }

    // Subtitle Editing
    const subtitleEl = container.querySelector('[data-editable="subtitle"]');
    if (subtitleEl) {
      subtitleEl.addEventListener('input', (e) => {
        store.updateSlideContent(activeSlide.id, { subtitle: e.target.innerText });
      });
    }

    // Body Editing
    const bodyEl = container.querySelector('[data-editable="body"]');
    if (bodyEl) {
      bodyEl.addEventListener('input', (e) => {
        store.updateSlideContent(activeSlide.id, { body: e.target.innerHTML });
      });
    }
  }
};
