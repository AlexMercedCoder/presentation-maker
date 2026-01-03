import { store } from '../core/Store';
import { Icons } from '../utils/Icons';

export const Sidebar = {
  render() {
    const slides = store.slides;
    const activeSlide = store.activeSlide;

    const listItems = slides.map((slide, index) => {
      const isActive = activeSlide && slide.id === activeSlide.id;
      return `
        <div class="slide-thumbnail ${isActive ? 'active' : ''}" data-id="${slide.id}">
          <div class="thumbnail-header">
            <span class="slide-num">${index + 1}</span>
            <div class="slide-actions">
              <button class="action-btn move-up" data-id="${slide.id}" title="Move Up">${Icons.moveUp}</button>
              <button class="action-btn move-down" data-id="${slide.id}" title="Move Down">${Icons.moveDown}</button>
              <button class="action-btn delete-btn" data-id="${slide.id}" title="Delete">${Icons.delete}</button>
            </div>
          </div>
          <div class="thumbnail-preview">
            <!-- Simple preview: Title text or Layout icon -->
            <small>${slide.content.title || 'Untitled'}</small>
            <br>
            <span class="layout-badge">${slide.layout}</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="sidebar">
        ${listItems}
      </div>
    `;
  },

  attachEvents(container) {
    // Selection
    container.querySelectorAll('.slide-thumbnail').forEach(el => {
      el.addEventListener('click', (e) => {
        // Prevent triggering selection when clicking actions
        if (e.target.closest('.action-btn')) return;
        store.setActiveSlide(el.dataset.id);
      });
    });

    // Delete
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        store.deleteSlide(btn.dataset.id);
      });
    });

    // Move Up
    container.querySelectorAll('.move-up').forEach(btn => {
      btn.addEventListener('click', () => {
        store.moveSlideUp(btn.dataset.id);
      });
    });

    // Move Down
    container.querySelectorAll('.move-down').forEach(btn => {
      btn.addEventListener('click', () => {
        store.moveSlideDown(btn.dataset.id);
      });
    });
  }
};
